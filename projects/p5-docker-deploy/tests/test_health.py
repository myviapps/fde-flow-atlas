from app.db import get_db
from app.main import app


def test_healthz_needs_no_api_key(client):
    client.headers.pop("X-API-Key")
    r = client.get("/healthz")
    assert r.status_code == 200 and r.json() == {"status": "ok"}


def test_readyz_checks_database(client):
    assert client.get("/readyz").json() == {"status": "ready"}


def test_readyz_returns_503_when_db_is_down(client):
    class BrokenSession:
        def execute(self, *_):
            raise RuntimeError("db down")

    app.dependency_overrides[get_db] = lambda: BrokenSession()
    assert client.get("/readyz").status_code == 503
