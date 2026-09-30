import asyncio
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import crm_data  # noqa: E402
import crm_server  # noqa: E402


@pytest.fixture(autouse=True)
def fresh_data():
    crm_data.reset()


def test_search_by_name_and_stage():
    assert [c["id"] for c in crm_server.search_customers("acme")] == ["C001"]
    assert [c["id"] for c in crm_server.search_customers("trial")] == ["C002"]


def test_search_limit_is_clamped():
    assert len(crm_server.search_customers("", limit=1000)) <= 20


def test_get_customer_includes_notes():
    record = crm_server.get_customer("C003")
    assert record["stage"] == "negotiation"
    assert "SSO" in record["notes"][0]


def test_unknown_customer_raises_helpful_error():
    with pytest.raises(ValueError, match="search_customers"):
        crm_server.get_customer("C999")


def test_add_note_appends_and_validates():
    out = crm_server.add_note("C002", "  Trial extended by 2 weeks. ")
    assert out["notes"][-1].endswith("Trial extended by 2 weeks.")
    with pytest.raises(ValueError):
        crm_server.add_note("C002", "x" * 501)


def test_resource_text():
    text = crm_server.pipeline_summary()
    assert "negotiation: 1" in text and "Total ARR: $165,000" in text


def test_server_registers_tools_and_resource():
    tools = asyncio.run(crm_server.mcp.list_tools())
    assert {t.name for t in tools} == {"search_customers", "get_customer", "add_note"}
    resources = asyncio.run(crm_server.mcp.list_resources())
    assert [str(r.uri) for r in resources] == ["crm://pipeline/summary"]
