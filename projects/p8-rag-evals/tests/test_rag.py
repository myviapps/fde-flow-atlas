import os
import sys
from pathlib import Path

import numpy as np
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ["LLM_MODE"] = "fake"
os.environ["EMBED_MODE"] = "hash"

from eval import faithfulness, run  # noqa: E402
from rag.answer import NO_ANSWER, answer  # noqa: E402
from rag.embed import HashingEmbedder  # noqa: E402
from rag.index import build_index, chunk_doc, load_docs  # noqa: E402


@pytest.fixture(scope="module")
def setup():
    emb = HashingEmbedder()
    return build_index(emb), emb


def test_ten_docs_with_acls():
    docs = load_docs()
    assert len(docs) == 10
    assert {d["acl"] for d in docs} == {"all", "hr", "finance"}


def test_chunks_respect_size_and_keep_ids():
    doc = {"id": "d", "title": "T", "acl": "all", "body": "\n\n".join(["x" * 150] * 5)}
    chunks = chunk_doc(doc, max_chars=400)
    assert [c.id for c in chunks] == ["d#0", "d#1", "d#2"]
    assert all(len(c.text) <= 400 for c in chunks)


def test_hashing_embedder_is_deterministic_and_normalized():
    a, b = HashingEmbedder().embed(["remote work stipend"]), HashingEmbedder().embed(["remote work stipend"])
    assert np.allclose(a, b) and np.isclose(np.linalg.norm(a[0]), 1.0)


def test_answer_cites_top_chunk(setup):
    store, emb = setup
    out = answer("How many weeks of parental leave do primary caregivers get?", store, emb)
    assert "16 weeks" in out["answer"] and "[parental_leave#0]" in out["answer"]


def test_acl_blocks_hr_doc_for_regular_user(setup):
    store, emb = setup
    out = answer("What is the salary band for L3 engineers?", store, emb, groups=[])
    assert all(c.acl == "all" for c, _ in out["hits"])
    assert "95,000" not in out["answer"]
    assert "95,000" in answer("What is the salary band for L3 engineers?", store, emb, groups=["hr"])["answer"]


def test_faithfulness_flags_unsupported_sentence(setup):
    store, emb = setup
    hits = answer("How long must passwords be?", store, emb)["hits"]
    good = "Passwords must be at least 14 characters long and unique to each system. [security#0]"
    bad = "Passwords must be changed every week by the CEO personally. [security#0]"
    assert faithfulness(good, hits) == 1.0
    assert faithfulness(bad, hits) == 0.0
    assert faithfulness(NO_ANSWER, hits) == 1.0


def test_golden_set_meets_quality_gates():
    summary = run(k=3)
    assert summary["questions"] == 15
    assert summary["recall@3"] >= 0.8 and summary["faithfulness"] >= 0.8 and summary["acl_leaks"] == 0
