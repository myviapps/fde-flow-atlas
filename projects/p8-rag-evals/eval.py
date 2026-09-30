"""Run the golden set: retrieval recall@k, fact accuracy, faithfulness, ACL leaks.

Usage: python eval.py [--k 3]      Exit code 1 if a quality gate fails (use it in CI).
"""
import argparse
import json
import re
import sys
from pathlib import Path

from rag.answer import NO_ANSWER, answer, sentences
from rag.embed import make_embedder, tokens
from rag.index import build_index

GOLDEN = Path(__file__).resolve().parent / "evals" / "golden.jsonl"


def faithfulness(answer_text, hits, threshold=0.7):
    """Share of answer sentences that are supported by the chunks they cite.

    A sentence counts as supported when it cites at least one retrieved chunk and
    at least `threshold` of its content words appear in the cited chunk text.
    A crude, cheap proxy; an LLM-as-judge is the usual upgrade.
    """
    if answer_text == NO_ANSWER:
        return 1.0
    by_id = {c.id: c.text for c, _ in hits}
    sents = sentences(answer_text)
    supported = 0
    for s in sents:
        cited = re.findall(r"\[([\w#]+)\]", s)
        source = " ".join(by_id.get(c, "") for c in cited)
        words = set(tokens(re.sub(r"\[[\w#]+\]", "", s)))
        if cited and source and words and len(words & set(tokens(source))) / len(words) >= threshold:
            supported += 1
    return supported / len(sents) if sents else 0.0


def run(k=3):
    embedder = make_embedder()
    store = build_index(embedder)
    rows = [json.loads(line) for line in GOLDEN.read_text().splitlines() if line.strip()]
    hits_at_k, facts_ok, faith, leaks, answerable = 0, 0, [], 0, 0
    print(f"{'id':<4} {'recall':<6} {'fact':<5} {'faith':<5} question")
    for row in rows:
        result = answer(row["question"], store, embedder, row["groups"], k)
        docs = [c.doc_id for c, _ in result["hits"]]
        f = faithfulness(result["answer"], result["hits"])
        faith.append(f)
        if row["expected_doc"]:
            answerable += 1
            hit = row["expected_doc"] in docs
            fact = row["fact"].lower() in result["answer"].lower()
            hits_at_k += hit
            facts_ok += fact
            print(f"{row['id']:<4} {'yes' if hit else 'NO':<6} {'yes' if fact else 'NO':<5} {f:<5.2f} {row['question']}")
        else:
            leaked = row["forbidden_doc"] in docs
            leaks += leaked
            print(f"{row['id']:<4} {'-':<6} {'-':<5} {f:<5.2f} {row['question']}  (ACL check: {'LEAK' if leaked else 'ok'})")
    summary = {
        f"recall@{k}": round(hits_at_k / answerable, 3),
        "fact_accuracy": round(facts_ok / answerable, 3),
        "faithfulness": round(sum(faith) / len(faith), 3),
        "acl_leaks": leaks,
        "questions": len(rows),
    }
    print("\n" + json.dumps(summary, indent=2))
    return summary


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--k", type=int, default=3)
    s = run(parser.parse_args().k)
    gates_ok = list(s.values())[0] >= 0.8 and s["faithfulness"] >= 0.8 and s["acl_leaks"] == 0
    sys.exit(0 if gates_ok else 1)
