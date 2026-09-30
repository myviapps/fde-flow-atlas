import sqlite3

import pytest

from load_db import build_db
from run_queries import load_queries, main, run_query

QUERIES = load_queries()


@pytest.fixture
def conn():
    c = build_db()  # fresh in-memory database for every test
    yield c
    c.close()


def rows(conn, name):
    return run_query(conn, QUERIES[name])[1]


def test_all_eight_queries_are_found():
    assert len(QUERIES) == 8
    assert "fanout_bug" in QUERIES and "fanout_fix" in QUERIES


def test_tables_loaded(conn):
    counts = {t: conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
              for t in ("customers", "orders", "order_items")}
    assert counts == {"customers": 22, "orders": 12, "order_items": 19}


def test_order_totals_match_items(conn):
    # Data sanity check: the header total equals the sum of its lines.
    mismatches = conn.execute("""
        SELECT o.order_id FROM orders o JOIN order_items i ON i.order_id = o.order_id
        GROUP BY o.order_id HAVING ABS(o.total - SUM(i.qty * i.unit_price)) > 0.001
    """).fetchall()
    assert mismatches == []


def test_customers_per_country(conn):
    result = dict(rows(conn, "customers_per_country"))
    assert result == {"GB": 6, "JP": 5, "US": 4, "DE": 3, "BR": 2, "IN": 2}
    assert sum(result.values()) == 22


def test_revenue_by_customer_keeps_zero_revenue_customers(conn):
    result = rows(conn, "revenue_by_customer")
    assert len(result) == 22
    assert result[0] == (7, "Juno Haddad", 1, 100.0)
    assert sum(r[3] for r in result) == 485.0
    by_id = {r[0]: r for r in result}
    assert by_id[12][3] == 0      # only a pending order
    assert by_id[3][3] == 50.0    # refunded order is excluded


def test_customers_without_orders(conn):
    ids = [r[0] for r in rows(conn, "customers_without_orders")]
    assert len(ids) == 14
    assert 12 not in ids  # a pending order still counts as an order


def test_monthly_running_total(conn):
    assert rows(conn, "monthly_revenue_running") == [
        ("2024-01", 150.0, 150.0), ("2024-02", 10.0, 160.0), ("2024-03", 325.0, 485.0)]


def test_top_customer_per_country(conn):
    assert rows(conn, "top_customer_per_country") == [
        ("GB", "Juno Haddad", 100.0), ("JP", "Dara Li", 55.0), ("US", "Dara Kim", 75.0)]


def test_days_between_orders(conn):
    gaps = {(r[0], r[1]): r[4] for r in rows(conn, "days_between_orders")}
    assert gaps == {(1, 102): 36, (3, 105): 16, (9, 112): 62, (21, 110): 5}


def test_fanout_bug_inflates_and_fix_matches_truth(conn):
    bug = {r[0]: r[2] for r in rows(conn, "fanout_bug")}
    fix = {r[0]: r[2] for r in rows(conn, "fanout_fix")}
    truth = {r[0]: r[3] for r in rows(conn, "revenue_by_customer") if r[3] > 0}
    assert sum(bug.values()) == 835.0   # wrong: totals repeated per item row
    assert fix == truth                 # right: one row per order before joining
    assert bug[7] == fix[7]             # single-item orders hide the bug


def test_units_are_the_same_in_bug_and_fix(conn):
    bug_units = {r[0]: r[3] for r in rows(conn, "fanout_bug")}
    fix_units = {r[0]: r[3] for r in rows(conn, "fanout_fix")}
    assert bug_units == fix_units  # line-level columns are fine; header-level ones are not


def test_foreign_keys_are_enforced(conn):
    with pytest.raises(sqlite3.IntegrityError):
        conn.execute("INSERT INTO orders VALUES (999, 12345, '2024-01-01', 'completed', 1.0)")


def test_runner_prints_named_query(capsys):
    assert main(["fanout_fix"]) == 0
    out = capsys.readouterr().out
    assert "== fanout_fix (7 rows)" in out and "Juno Haddad" in out
