import json

import pytest

from agent.tools import ToolError, execute_tool, load_store, validate


@pytest.fixture
def store():
    return load_store()


def test_get_order_found(store):
    out, is_error = execute_tool(store, "get_order", {"order_id": "A1001"})
    assert not is_error
    assert json.loads(out)["tracking"] == "TRK-555001"


def test_get_order_missing_is_error_not_crash(store):
    out, is_error = execute_tool(store, "get_order", {"order_id": "A9999"})
    assert is_error and "no order" in out


@pytest.mark.parametrize(
    "name,args",
    [
        ("get_order", {}),                                  # missing argument
        ("get_order", {"order_id": "1001; DROP TABLE"}),    # bad format
        ("get_order", {"order_id": "A1001", "admin": "1"}),  # unexpected argument
        ("track_shipment", {"tracking_number": 42}),        # wrong type
        ("delete_order", {"order_id": "A1001"}),            # unknown tool
    ],
)
def test_validation_rejects_bad_args(name, args):
    with pytest.raises(ToolError):
        validate(name, args)


def test_search_policy_ranks_returns_first(store):
    out, _ = execute_tool(store, "search_policy", {"query": "how do I return and get a refund"})
    assert json.loads(out)["results"][0]["id"] == "returns"
