"""Ask one question: python ask.py "How many PTO days do I get?" --groups hr"""
import argparse

from rag.answer import answer
from rag.embed import make_embedder
from rag.index import build_index

parser = argparse.ArgumentParser()
parser.add_argument("question")
parser.add_argument("--groups", nargs="*", default=[], help="ACL groups the user belongs to, e.g. hr finance")
parser.add_argument("--k", type=int, default=3)
args = parser.parse_args()

embedder = make_embedder()
store = build_index(embedder)
result = answer(args.question, store, embedder, args.groups, args.k)
print("Retrieved:")
for chunk, score in result["hits"]:
    print(f"  {score:.3f}  {chunk.id:<22} ({chunk.acl})")
print(f"\nAnswer: {result['answer']}")
