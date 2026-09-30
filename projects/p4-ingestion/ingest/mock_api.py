"""A fake paginated "customer API" that misbehaves on purpose.

It behaves like an HTTP API: get_page(cursor) returns (status_code, body, headers).
You can script failures (429 rate limits, 500 errors) and it always serves a few
malformed rows, so the client has to cope with all three.
"""
import base64
import random


def encode_cursor(offset: int) -> str:
    # Real APIs return opaque cursors; clients must never parse them.
    return base64.urlsafe_b64encode(f"offset:{offset}".encode()).decode()


def decode_cursor(cursor: str | None) -> int:
    if not cursor:
        return 0
    return int(base64.urlsafe_b64decode(cursor.encode()).decode().split(":")[1])


def make_customers(n: int = 25, seed: int = 7) -> list[dict]:
    """Deterministic sample data. Every 6th row is broken in a different way."""
    rng = random.Random(seed)
    plans = ["free", "pro", "enterprise"]
    rows = []
    for i in range(1, n + 1):
        row = {
            "id": i,
            "name": f"Customer {i}",
            "email": f"user{i}@example.com",
            "plan": rng.choice(plans),
            "signup_date": f"2024-{rng.randint(1, 12):02d}-{rng.randint(1, 28):02d}",
        }
        if i % 6 == 0:
            broken = [
                lambda r: r.update(email="not-an-email"),
                lambda r: r.pop("name"),
                lambda r: r.update(signup_date="31/02/2024"),
                lambda r: r.update(plan="platinum"),
            ]
            broken[(i // 6 - 1) % len(broken)](row)
        rows.append(row)
    return rows


class MockCustomerAPI:
    def __init__(self, rows: list[dict] | None = None, page_size: int = 10,
                 failures: list[int] | None = None):
        self.rows = rows if rows is not None else make_customers()
        self.page_size = page_size
        self.failures = list(failures or [])  # status codes to return, in order, before succeeding
        self.calls = 0

    def get_page(self, cursor: str | None = None) -> tuple[int, dict, dict]:
        self.calls += 1
        if self.failures:
            code = self.failures.pop(0)
            headers = {"Retry-After": "1"} if code == 429 else {}
            return code, {"error": "simulated failure"}, headers
        start = decode_cursor(cursor)
        chunk = self.rows[start:start + self.page_size]
        end = start + len(chunk)
        next_cursor = encode_cursor(end) if end < len(self.rows) else None
        return 200, {"data": chunk, "next_cursor": next_cursor}, {}
