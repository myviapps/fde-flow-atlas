"""Ingest -> chunk -> embed -> store, and retrieval with an ACL filter."""
from dataclasses import dataclass
from pathlib import Path

import numpy as np

DOCS_DIR = Path(__file__).resolve().parent.parent / "docs"


@dataclass
class Chunk:
    id: str      # "pto#1"
    doc_id: str  # "pto"
    title: str
    acl: str     # "all", "hr", "finance"
    text: str


def load_docs(folder=DOCS_DIR):
    """Read markdown files with a small front-matter header (title, acl)."""
    docs = []
    for path in sorted(Path(folder).glob("*.md")):
        _, header, body = path.read_text(encoding="utf-8").split("---", 2)
        meta = dict(line.split(":", 1) for line in header.strip().splitlines())
        meta = {k.strip(): v.strip() for k, v in meta.items()}
        docs.append({"id": path.stem, "title": meta["title"], "acl": meta.get("acl", "all"), "body": body.strip()})
    return docs


def chunk_doc(doc, max_chars=400):
    """Split on blank lines, then pack paragraphs into chunks up to max_chars."""
    chunks, current = [], ""
    for para in [p.strip() for p in doc["body"].split("\n\n") if p.strip()]:
        if current and len(current) + len(para) > max_chars:
            chunks.append(current)
            current = ""
        current = (current + "\n\n" + para).strip()
    if current:
        chunks.append(current)
    return [Chunk(f"{doc['id']}#{i}", doc["id"], doc["title"], doc["acl"], text) for i, text in enumerate(chunks)]


class InMemoryStore:
    """Numpy fallback for pgvector: a matrix of unit vectors plus metadata."""

    def __init__(self):
        self.chunks, self.vectors = [], None

    def add(self, chunks, vectors):
        self.chunks.extend(chunks)
        self.vectors = vectors if self.vectors is None else np.vstack([self.vectors, vectors])

    def search(self, query_vec, k, allowed_acls):
        # Filter BEFORE ranking so forbidden text can never reach the prompt.
        allowed = np.array([c.acl in allowed_acls for c in self.chunks])
        scores = self.vectors @ query_vec          # cosine similarity (vectors are normalized)
        scores = np.where(allowed, scores, -np.inf)
        order = np.argsort(-scores)[:k]
        return [(self.chunks[i], float(scores[i])) for i in order if np.isfinite(scores[i])]


def build_index(embedder, folder=DOCS_DIR):
    store = InMemoryStore()
    chunks = [c for doc in load_docs(folder) for c in chunk_doc(doc)]
    # Prefix the title so each chunk carries its context ("contextual chunk header").
    store.add(chunks, embedder.embed([f"{c.title}. {c.text}" for c in chunks]))
    return store


def retrieve(store, embedder, question, groups, k=3):
    allowed = {"all", *groups}
    return store.search(embedder.embed([question])[0], k, allowed)
