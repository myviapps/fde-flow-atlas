"""The resilient ingestion client: paginate, retry, validate, store, checkpoint."""
import logging

from pydantic import ValidationError
from tenacity import (Retrying, before_sleep_log, retry_if_exception_type,
                      stop_after_attempt, wait_exponential_jitter)

from ingest.models import Customer
from ingest.store import Store

log = logging.getLogger("ingest")
RETRYABLE = {429, 500, 502, 503, 504}


class RetryableHTTPError(Exception):
    def __init__(self, status: int):
        super().__init__(f"retryable HTTP {status}")
        self.status = status


class PermanentHTTPError(Exception):
    pass


def fetch_page(api, cursor, max_attempts: int = 5, wait=None) -> dict:
    """Call the API with exponential backoff plus jitter on 429/5xx."""
    retryer = Retrying(
        retry=retry_if_exception_type(RetryableHTTPError),
        stop=stop_after_attempt(max_attempts),
        # 0.5s, 1s, 2s, 4s ... capped at 10s, each plus up to 1s of random jitter so
        # many clients don't retry in lockstep (the "thundering herd").
        wait=wait or wait_exponential_jitter(initial=0.5, max=10, jitter=1),
        before_sleep=before_sleep_log(log, logging.WARNING),
        reraise=True,  # surface the real error, not tenacity's RetryError wrapper
    )
    for attempt in retryer:
        with attempt:
            status, body, _headers = api.get_page(cursor)
            if status in RETRYABLE:
                raise RetryableHTTPError(status)
            if status != 200:
                raise PermanentHTTPError(f"HTTP {status}: {body}")  # 4xx: retrying won't help
            return body
    raise AssertionError("unreachable")


def run_ingestion(api, store: Store, max_attempts: int = 5, wait=None) -> dict:
    cursor, done = store.load_checkpoint()
    if done:
        log.info("already complete; nothing to do")
        return {"pages": 0, "good": 0, "bad": 0}
    stats = {"pages": 0, "good": 0, "bad": 0}
    while True:
        body = fetch_page(api, cursor, max_attempts, wait)
        good, bad = [], []
        for raw in body.get("data", []):
            try:
                good.append(Customer.model_validate(raw))
            except ValidationError as e:
                bad.append((raw, "; ".join(f"{'.'.join(map(str, err['loc']))}: {err['msg']}"
                                           for err in e.errors())))
        next_cursor = body.get("next_cursor")
        store.save_page(good, bad, cursor, next_cursor)
        stats["pages"] += 1
        stats["good"] += len(good)
        stats["bad"] += len(bad)
        log.info("page done: %d good, %d bad", len(good), len(bad))
        if next_cursor is None:
            return stats
        cursor = next_cursor
