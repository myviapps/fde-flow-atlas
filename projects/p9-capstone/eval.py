"""Run the golden set through the real HTTP endpoint and print a scorecard.

Exit code 1 if quality drops below the thresholds, so CI can use it as a gate.
Usage: python eval.py            (uses LLM_MODE from the environment, default fake)
"""
import json
import logging
import sys
from pathlib import Path

from fastapi.testclient import TestClient

from app.llm import REFUSAL
from app.main import app

MIN_ACCURACY, MIN_GROUNDED = 0.9, 1.0
logging.disable(logging.INFO)  # hide per-request log lines; the scorecard is enough


def main() -> int:
    client = TestClient(app)
    rows = [json.loads(l) for l in Path("data/golden.jsonl").read_text().splitlines() if l.strip()]
    correct = grounded = 0
    latency = cost = 0.0
    for row in rows:
        r = client.post("/ask", json={"question": row["question"], "user_groups": row["groups"]}).json()
        if row["expect_source"] is None:
            ok = r["answer"] == REFUSAL
        else:
            ok = row["expect_source"] in r["sources"]
        correct += ok
        grounded += r["metrics"]["grounded"]
        latency += r["metrics"]["latency_ms"]
        cost += r["metrics"]["est_cost_usd"]
        print(f"{'PASS' if ok else 'FAIL'}  {row['groups']}  {row['question']}")
    n = len(rows)
    acc, grd = correct / n, grounded / n
    print(f"\naccuracy {acc:.0%}  grounded {grd:.0%}  avg latency {latency / n:.1f} ms  total est cost ${cost:.4f}")
    return 0 if acc >= MIN_ACCURACY and grd >= MIN_GROUNDED else 1


if __name__ == "__main__":
    sys.exit(main())
