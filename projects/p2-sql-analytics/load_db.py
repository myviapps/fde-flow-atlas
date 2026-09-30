"""load_db.py: build a SQLite database from the CSV files in data/.

Usage:  python load_db.py --db shop.db [--customers ../p1-csv-cleaner/output/clean.csv]
"""
import argparse
import csv
import sqlite3
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

SCHEMA = """
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    signup_date TEXT NOT NULL,          -- ISO date, YYYY-MM-DD
    country     TEXT NOT NULL
);
CREATE TABLE orders (
    order_id    INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
    order_date  TEXT NOT NULL,
    status      TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'refunded')),
    total       REAL NOT NULL           -- order-level amount: one value per order
);
CREATE TABLE order_items (
    order_id    INTEGER NOT NULL REFERENCES orders(order_id),
    product     TEXT NOT NULL,
    qty         INTEGER NOT NULL,
    unit_price  REAL NOT NULL
);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_items_order ON order_items(order_id);
"""


def read_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def insert_rows(conn, table, rows):
    if not rows:
        return 0
    cols = list(rows[0].keys())
    sql = f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({', '.join('?' for _ in cols)})"
    conn.executemany(sql, [tuple(r[c] for c in cols) for r in rows])
    return len(rows)


def build_db(db_path=":memory:", customers_csv=None, data_dir=DATA_DIR):
    """Create the tables and load the CSVs. Returns an open connection."""
    data_dir = Path(data_dir)
    if db_path != ":memory:":
        Path(db_path).unlink(missing_ok=True)  # always rebuild from scratch
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    with conn:  # one transaction: all tables load, or none do
        insert_rows(conn, "customers", read_csv(customers_csv or data_dir / "customers.csv"))
        insert_rows(conn, "orders", read_csv(data_dir / "orders.csv"))
        insert_rows(conn, "order_items", read_csv(data_dir / "order_items.csv"))
    return conn


def main(argv=None):
    parser = argparse.ArgumentParser(description="Load CSVs into SQLite.")
    parser.add_argument("--db", default="shop.db")
    parser.add_argument("--customers", help="customers CSV (default: data/customers.csv)")
    args = parser.parse_args(argv)
    conn = build_db(args.db, args.customers)
    for table in ("customers", "orders", "order_items"):
        count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print(f"{table:<12} {count:>4} rows")
    conn.close()
    print(f"Saved {args.db}")


if __name__ == "__main__":
    main()
