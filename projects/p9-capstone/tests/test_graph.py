from app.corpus import search
from app.graph import build_graph
from app.llm import LLM, REFUSAL


def run(question, groups, max_rewrites=2):
    return build_graph(LLM("fake"), max_rewrites).invoke(
        {"question": question, "query": question, "groups": groups, "rewrites": 0})


def test_acl_filter_hides_restricted_docs():
    ids = [d["id"] for d in search("adjusters approve claims supervisor", ["public"], k=8)]
    assert "ADJ-AUTH-05" not in ids
    assert "ADJ-AUTH-05" in [d["id"] for d in search("adjusters approve claims supervisor", ["adjuster"])]


def test_direct_hit_needs_no_rewrite():
    out = run("How many days do I have to report an auto collision claim?", ["public"])
    assert out["sources"][0] == "POL-AUTO-01" and out["rewrites"] == 0 and out["grounded"]


def test_rewrite_rescues_casual_wording():
    out = run("How long do I have to report a car crash?", ["public"])
    assert out["rewrites"] >= 1 and "POL-AUTO-01" in out["sources"]


def test_retry_cap_then_refusal():
    out = run("What is the capital of France?", ["public"], max_rewrites=2)
    assert out["rewrites"] == 2 and out["answer"] == REFUSAL


def test_grounding_check_rejects_made_up_answer():
    llm = LLM("fake")
    docs = search("theft police report", ["public"])
    assert not llm.is_grounded("The moon is made of green cheese [POL-HOME-03]", docs)
    assert llm.is_grounded("A police report is required within 7 days of discovering the theft. [POL-HOME-03]", docs)
