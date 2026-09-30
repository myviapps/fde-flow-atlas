"""run_queries.py: run the named queries in queries.sql and print the results.

Usage:
  python run_queries.py                    # all queries, fresh in-memory database
  python run_queries.py fanout_bug fanout_fix
  python run_queries.py --db shop.db       # use a database built by load_db.py
"""
import argparse
import re
import sqlite3
import sys
from pathlib import Path

from load_db import build_db

QUERIES_FILE = Path(__file__).parent / "queries.sql"
NAME_RE = re.compile(r"^--\s*name:\s*(\w+)\s*$", re.MULTILINE)


def load_queries(path=QUERIES_FILE):
    """Split queries.sql into {name: sql} using the '-- name:' marker lines."""
    text = Path(path).read_text(encoding="utf-8")
    parts = NAME_RE.split(text)  # [preamble, name1, sql1, name2, sql2, ...]
    return {name: sql.strip() for name, sql in zip(parts[1::2], parts[2::2])}


def run_query(conn, sql):
    cur = conn.execute(sql)
    columns = [d[0] for d in cur.description]
    return columns, cur.fetchall()


def format_table(columns, rows):
    cells = [[str(c) for c in columns]] + [["" if v is None else str(v) for v in r] for r in rows]
    widths = [max(len(row[i]) for row in cells) for i in range(len(columns))]
    lines = ["  ".join(v.ljust(w) for v, w in zip(row, widths)) for row in cells]
    lines.insert(1, "  ".join("-" * w for w in widths))
    return "\n".join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Run analysis queries.")
    parser.add_argument("names", nargs="*", help="query names to run (default: all)")
    parser.add_argument("--db", help="existing SQLite file (default: build in memory)")
    args = parser.parse_args(argv)

    queries = load_queries()
    unknown = [n for n in args.names if n not in queries]
    if unknown:
        parser.error(f"unknown query: {', '.join(unknown)}. Choose from: {', '.join(queries)}")

    conn = sqlite3.connect(args.db) if args.db else build_db()
    for name in args.names or queries:
        columns, rows = run_query(conn, queries[name])
        print(f"== {name} ({len(rows)} rows)")
        print(format_table(columns, rows))
        print()
    conn.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
