"""Run the ingestion against the flaky mock API and print a summary.

Usage: python run.py [--db ingest.db] [--fail 429,500,500]
"""
import argparse
import logging

from ingest.client import run_ingestion
from ingest.mock_api import MockCustomerAPI
from ingest.store import Store

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--db", default="ingest.db")
    p.add_argument("--fail", default="429,500", help="status codes the mock returns first")
    args = p.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    failures = [int(x) for x in args.fail.split(",") if x]
    api = MockCustomerAPI(failures=failures)
    store = Store(args.db)
    stats = run_ingestion(api, store)
    print(f"run: {stats} | API calls: {api.calls}")
    print(f"table totals: customers={store.count('customers')} "
          f"dead_letter={store.count('dead_letter')}")
    for raw, err in store.conn.execute("SELECT raw, error FROM dead_letter LIMIT 3"):
        print("  DLQ:", err, "<-", raw[:60])
