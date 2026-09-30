"""Test fixtures: a fresh in-memory database and an API key for every test."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite://")  # never touch tickets.db during tests

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app

TEST_KEY = "test-key"


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setenv("API_KEY", TEST_KEY)
    # StaticPool keeps ONE connection so the in-memory DB survives across requests.
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                           poolclass=StaticPool)
    Base.metadata.create_all(engine)
    TestSession = sessionmaker(bind=engine, expire_on_commit=False)

    def override_get_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, headers={"X-API-Key": TEST_KEY}) as c:
        yield c
    app.dependency_overrides.clear()
