"""SQLite storage: good rows, dead-letter rows, and the cursor checkpoint."""
import json
import sqlite3

from ingest.models import Customer

SCHEMA = """
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY, name TEXT, email TEXT, plan TEXT, signup_date TEXT
);
CREATE TABLE IF NOT EXISTS dead_letter (
    id INTEGER PRIMARY KEY AUTOINCREMENT, raw TEXT, error TEXT, cursor TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS checkpoint (
    name TEXT PRIMARY KEY, cursor TEXT, done INTEGER DEFAULT 0
);
"""


class Store:
    def __init__(self, path: str = "ingest.db", job: str = "customers"):
        self.conn = sqlite3.connect(path)
        self.conn.executescript(SCHEMA)
        self.job = job

    def load_checkpoint(self) -> tuple[str | None, bool]:
        row = self.conn.execute(
            "SELECT cursor, done FROM checkpoint WHERE name = ?", (self.job,)).fetchone()
        return (row[0], bool(row[1])) if row else (None, False)

    def save_page(self, good: list[Customer], bad: list[tuple[dict, str]],
                  page_cursor: str | None, next_cursor: str | None) -> None:
        """Write one page's rows AND the new checkpoint in a single transaction.

        If we crash mid-page, nothing from that page is committed and the cursor
        still points at it, so the rerun redoes exactly that page.
        """
        with self.conn:  # commits on success, rolls back on exception
            self.conn.executemany(
                # Upsert makes replays idempotent: re-ingesting a row never duplicates it.
                "INSERT INTO customers (id, name, email, plan, signup_date) VALUES (?,?,?,?,?) "
                "ON CONFLICT(id) DO UPDATE SET name=excluded.name, email=excluded.email, "
                "plan=excluded.plan, signup_date=excluded.signup_date",
                [(c.id, c.name, c.email, c.plan, c.signup_date.isoformat()) for c in good],
            )
            self.conn.executemany(
                "INSERT INTO dead_letter (raw, error, cursor) VALUES (?,?,?)",
                [(json.dumps(raw), err, page_cursor) for raw, err in bad],
            )
            self.conn.execute(
                "INSERT INTO checkpoint (name, cursor, done) VALUES (?,?,?) "
                "ON CONFLICT(name) DO UPDATE SET cursor=excluded.cursor, done=excluded.done",
                (self.job, next_cursor, int(next_cursor is None)),
            )

    def count(self, table: str) -> int:
        assert table in {"customers", "dead_letter"}
        return self.conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
