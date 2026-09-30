import pytest
from tenacity import wait_none

from ingest.client import PermanentHTTPError, RetryableHTTPError, run_ingestion
from ingest.mock_api import MockCustomerAPI, decode_cursor, make_customers
from ingest.store import Store

FAST = wait_none()  # no sleeping in tests


@pytest.fixture()
def store(tmp_path):
    return Store(str(tmp_path / "t.db"))


def test_happy_path_splits_good_and_bad(store):
    stats = run_ingestion(MockCustomerAPI(), store, wait=FAST)
    assert stats == {"pages": 3, "good": 21, "bad": 4}   # rows 6, 12, 18, 24 are broken
    assert store.count("customers") == 21
    assert store.count("dead_letter") == 4
    assert store.load_checkpoint() == (None, True)


def test_dead_letter_keeps_raw_row_and_reason(store):
    run_ingestion(MockCustomerAPI(), store, wait=FAST)
    errors = [e for (e,) in store.conn.execute("SELECT error FROM dead_letter ORDER BY id")]
    assert "email" in errors[0] and "name" in errors[1]
    assert "signup_date" in errors[2] and "plan" in errors[3]


def test_retries_through_429_and_500(store):
    api = MockCustomerAPI(failures=[429, 500, 503])
    stats = run_ingestion(api, store, wait=FAST)
    assert stats["good"] == 21
    assert api.calls == 3 + 3   # three failures, then three pages


def test_gives_up_after_max_attempts(store):
    api = MockCustomerAPI(failures=[500] * 10)
    with pytest.raises(RetryableHTTPError):
        run_ingestion(api, store, max_attempts=4, wait=FAST)
    assert api.calls == 4


def test_4xx_is_not_retried(store):
    api = MockCustomerAPI(failures=[400])
    with pytest.raises(PermanentHTTPError):
        run_ingestion(api, store, wait=FAST)
    assert api.calls == 1


class DiesAfterFirstPage(MockCustomerAPI):
    """Serves page 1, then returns 500 forever (an outage mid-run)."""
    def get_page(self, cursor=None):
        if self.calls >= 1:
            self.calls += 1
            return 500, {}, {}
        return super().get_page(cursor)


def test_resumes_from_checkpoint_without_duplicates(store):
    api = DiesAfterFirstPage()
    with pytest.raises(RetryableHTTPError):
        run_ingestion(api, store, max_attempts=3, wait=FAST)
    cursor, done = store.load_checkpoint()
    assert decode_cursor(cursor) == 10 and not done
    assert store.count("customers") == 9   # page 1 had 10 rows, 1 bad

    # Second run with a healthy API picks up at row 11, not row 1.
    api2 = MockCustomerAPI()
    stats = run_ingestion(api2, store, wait=FAST)
    assert stats["pages"] == 2 and api2.calls == 2
    assert store.count("customers") == 21
    # A third run is a no-op because the job is marked done.
    assert run_ingestion(MockCustomerAPI(), store, wait=FAST)["pages"] == 0


def test_mock_data_is_deterministic():
    assert make_customers() == make_customers()
