from types import SimpleNamespace

from agent.llm import FakeLLM
from agent.loop import Trace, run_agent


def tool_names(result):
    return [e["name"] for e in result["trace"] if e["kind"] == "tool"]


def test_tracking_question_chains_two_tools():
    result = run_agent("Where is my order A1001?", FakeLLM())
    assert tool_names(result) == ["get_order", "track_shipment"]
    assert "in transit" in result["answer"] and result["steps"] == 3


def test_policy_question_uses_search():
    result = run_agent("Can I return something I bought?", FakeLLM())
    assert tool_names(result) == ["search_policy"]
    assert "30 days" in result["answer"]


def test_unknown_order_is_reported_gracefully():
    result = run_agent("Where is order A9999?", FakeLLM())
    assert any(e["kind"] == "tool" and e["is_error"] for e in result["trace"])
    assert "could not find" in result["answer"]


class LoopingLLM:
    """A misbehaving model that asks for a tool forever."""

    def create(self, system, messages, tools):
        block = SimpleNamespace(type="tool_use", id=f"t{len(messages)}", name="get_order", input={"order_id": "A1001"})
        return SimpleNamespace(stop_reason="tool_use", content=[block])


def test_iteration_cap_stops_runaway_loop():
    result = run_agent("loop please", LoopingLLM(), max_iterations=3)
    assert result["steps"] == 3
    assert result["trace"][-1]["kind"] == "capped"
    assert "human agent" in result["answer"]


def test_trace_written_to_file(tmp_path):
    path = tmp_path / "trace.jsonl"
    run_agent("Where is my order A1001?", FakeLLM(), trace=Trace(path))
    lines = path.read_text().strip().splitlines()
    assert len(lines) >= 5  # user, model, tool, model, tool, model, final
