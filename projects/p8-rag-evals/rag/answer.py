"""Answer a question from retrieved chunks, with [chunk-id] citations."""
import os
import re

from rag.embed import tokens
from rag.index import retrieve

NO_ANSWER = "I don't know based on the documents you can access."
MIN_SCORE = 0.08  # below this, retrieval found nothing relevant: abstain instead of guessing

SYSTEM = (
    "Answer the employee's question using ONLY the sources provided. After each sentence, "
    "cite the source id in square brackets, like [pto#0]. If the sources do not contain the "
    f"answer, reply exactly: {NO_ANSWER}"
)


def sentences(text):
    return [s.strip() for s in re.split(r"(?<=[.!?\]])\s+(?!\[)", text) if s.strip()]


def fake_answer(question, hits):
    """Offline mode: return the sentence from the top chunk that best overlaps the question."""
    top = hits[0][0]
    q = set(tokens(question))
    best = max(sentences(top.text), key=lambda s: len(q & set(tokens(s))))
    return f"{best} [{top.id}]"


def real_answer(question, hits):
    import anthropic

    context = "\n\n".join(f"<source id=\"{c.id}\" title=\"{c.title}\">\n{c.text}\n</source>" for c, _ in hits)
    response = anthropic.Anthropic().messages.create(
        model=os.environ["MODEL"],
        max_tokens=16000,
        system=SYSTEM,
        messages=[{"role": "user", "content": f"{context}\n\nQuestion: {question}"}],
    )
    return "".join(b.text for b in response.content if b.type == "text").strip()


def answer(question, store, embedder, groups=(), k=3):
    hits = retrieve(store, embedder, question, groups, k)
    if not hits or hits[0][1] < MIN_SCORE:
        return {"answer": NO_ANSWER, "hits": hits}
    mode = os.environ.get("LLM_MODE", "fake")
    text = real_answer(question, hits) if mode == "real" else fake_answer(question, hits)
    return {"answer": text, "hits": hits}
