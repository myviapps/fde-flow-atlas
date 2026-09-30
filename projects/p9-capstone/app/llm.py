"""LLM wrapper with two modes.

LLM_MODE=fake (default): rule-based, offline, deterministic. Used by tests and eval.
LLM_MODE=real: Anthropic Messages API, model name from the MODEL env var.
Both modes count tokens so the service can log cost per request.
"""
import os
import re

from app.corpus import tokens

REFUSAL = "I don't know based on the policy documents you have access to."
SYNONYMS = {
    "car": "auto vehicle", "crash": "collision accident", "hit": "collision accident",
    "stolen": "theft police report", "robbed": "theft", "flood": "flood rider water",
    "leak": "water damage pipe", "rental": "rental car reimbursement",
    "sick": "illness cancellation", "limit": "approve claim dollars",
}


class LLM:
    def __init__(self, mode: str | None = None):
        self.mode = mode or os.getenv("LLM_MODE", "fake")
        self.tokens_in = 0
        self.tokens_out = 0
        if self.mode == "real":
            import anthropic  # imported lazily so fake mode needs no key

            self.client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY
            self.model = os.environ["MODEL"]

    # ---- plumbing -------------------------------------------------------
    def _call(self, prompt: str, max_tokens: int = 300) -> str:
        msg = self.client.messages.create(
            model=self.model, max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        self.tokens_in += msg.usage.input_tokens
        self.tokens_out += msg.usage.output_tokens
        return msg.content[0].text.strip()

    def _count_fake(self, prompt: str, output: str) -> None:
        self.tokens_in += len(prompt) // 4  # rough 4 chars per token
        self.tokens_out += len(output) // 4

    def cost_usd(self) -> float:
        price_in = float(os.getenv("PRICE_IN_PER_MTOK", "3.0"))
        price_out = float(os.getenv("PRICE_OUT_PER_MTOK", "15.0"))
        return round((self.tokens_in * price_in + self.tokens_out * price_out) / 1e6, 6)

    # ---- the four skills the graph needs --------------------------------
    def grade(self, query: str, doc: dict) -> bool:
        if self.mode == "real":
            p = f"Document:\n{doc['text']}\n\nQuestion: {query}\nIs this document useful for answering the question? Reply only yes or no."
            return self._call(p, 5).lower().startswith("yes")
        overlap = set(tokens(query)) & set(tokens(doc["text"]))
        self._count_fake(query + doc["text"], "yes")
        return len(overlap) >= 2

    def rewrite(self, query: str) -> str:
        if self.mode == "real":
            p = f"Rewrite this question as a keyword search query for insurance claims-policy documents. Return only the query.\n\n{query}"
            return self._call(p, 60)
        extra = [SYNONYMS[t] for t in tokens(query) if t in SYNONYMS]
        out = " ".join([query] + extra)
        self._count_fake(query, out)
        return out

    def generate(self, question: str, docs: list[dict]) -> str:
        context = "\n".join(f"[{d['id']}] {d['text']}" for d in docs)
        if self.mode == "real":
            p = (f"Answer the question using only these documents. Cite doc ids in square brackets. "
                 f"If the documents do not contain the answer, reply exactly: {REFUSAL}\n\n{context}\n\nQuestion: {question}")
            return self._call(p)
        # Extractive fake answer: the (up to) two sentences that overlap the question most.
        q = set(tokens(question))
        scored = [(len(q & set(tokens(sent))), sent, d["id"])
                  for d in docs for sent in re.split(r"(?<=\.)\s+", d["text"])]
        scored.sort(key=lambda x: x[0], reverse=True)
        picked = [scored[0]] + [x for x in scored[1:2] if x[0] >= max(2, scored[0][0] / 2)]
        answer = " ".join(f"{sent} [{doc_id}]" for _, sent, doc_id in picked)
        self._count_fake(context + question, answer)
        return answer

    def is_grounded(self, answer: str, docs: list[dict]) -> bool:
        if self.mode == "real":
            context = "\n".join(d["text"] for d in docs)
            p = f"Documents:\n{context}\n\nAnswer:\n{answer}\n\nIs every claim in the answer supported by the documents? Reply only yes or no."
            return self._call(p, 5).lower().startswith("yes")
        words = tokens(re.sub(r"\[[^\]]*\]", "", answer))
        support = set(t for d in docs for t in tokens(d["text"]))
        self._count_fake(answer, "yes")
        return bool(words) and sum(w in support for w in words) / len(words) >= 0.8
