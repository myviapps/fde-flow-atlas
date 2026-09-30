"""Scripted 3-minute customer demo. Run: python demo.py"""
import logging

from fastapi.testclient import TestClient

from app.main import app

logging.disable(logging.INFO)  # hide per-request log lines; metrics are printed below
client = TestClient(app)

SCRIPT = [
    ("A policyholder asks a plain question", "How many days do I have to report an auto collision claim?", ["public"]),
    ("Casual wording forces a query rewrite", "How long do I have to report a car crash?", ["public"]),
    ("An adjuster asks about authority limits", "What claim amount can adjusters approve without supervisor sign-off?", ["adjuster"]),
    ("Same question from a policyholder: ACL blocks it", "What claim amount can adjusters approve without supervisor sign-off?", ["public"]),
    ("Off-topic question: the assistant says it does not know", "What is the capital of France?", ["public"]),
]

for i, (beat, question, groups) in enumerate(SCRIPT, 1):
    r = client.post("/ask", json={"question": question, "user_groups": groups}).json()
    m = r["metrics"]
    print(f"\n{i}. {beat}\n   Q ({', '.join(groups)}): {question}\n   A: {r['answer']}")
    print(f"   sources={r['sources']} rewrites={m['rewrites']} grounded={m['grounded']} "
          f"tokens={m['tokens_in']}+{m['tokens_out']} cost=${m['est_cost_usd']} latency={m['latency_ms']}ms")
