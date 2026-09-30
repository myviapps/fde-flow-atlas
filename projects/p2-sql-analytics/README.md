# Project 2: SQL analytics

## Goal
Load the cleaned customers from Project 1 plus an orders table and an order_items table into SQLite, then answer business questions with 8 SQL queries, including a classic fan-out bug and its fix.

## What you'll learn
- Designing a small schema with primary keys, foreign keys and a CHECK constraint
- Joins (inner, left, anti-join), GROUP BY, HAVING and COALESCE
- Window functions: SUM() OVER, RANK() with PARTITION BY, LAG()
- Why joining a one-to-many table inflates sums (fan-out) and how to fix it
- Testing SQL by asserting exact results on small, known data

## Prerequisites
Project 1. Python's built-in sqlite3 module (SQLite 3.25+ for window functions; Python 3.12 includes a newer one). No server or Docker needed.

## Setup
```
cd p2-sql-analytics
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
`data/customers.csv` is a copy of Project 1's `clean.csv`, so this project runs on its own.

## Run
```
python run_queries.py                          # all 8 queries on a fresh in-memory database
python run_queries.py fanout_bug fanout_fix    # just two
python load_db.py --db shop.db                 # save a database file to explore
python run_queries.py --db shop.db
```
To use your own Project 1 output: `python load_db.py --db shop.db --customers ../p1-csv-cleaner/output/clean.csv`.
You can also open `shop.db` in the VS Code "SQLite Viewer" extension or the `sqlite3` command line tool.

## Test
```
python -m pytest -q
```

## Stretch goals
- Add a query for repeat-purchase rate (customers with 2+ completed orders / customers with any)
- Store money as integer cents and explain why
- Run `EXPLAIN QUERY PLAN` on revenue_by_customer with and without the index
- Port the database to Postgres with docker compose and run the same queries
