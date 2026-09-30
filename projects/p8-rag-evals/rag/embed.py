"""Embedders. The hashing one is deterministic and offline; the real one downloads a model."""
import hashlib
import os
import re

import numpy as np

STOP = set("a an the of to in on for and or is are be by with at from as it that this your you i we our do does can how what when who which much many any per".split())


def tokens(text):
    """Lowercase words minus stopwords, with a crude plural trim (days -> day)."""
    words = re.findall(r"[a-z0-9]+", text.lower())
    return [re.sub(r"(?<=[a-z]{3})s$", "", w) for w in words if w not in STOP]


class HashingEmbedder:
    """Feature hashing of words and word pairs into a fixed-size unit vector.

    Not semantic (it will not know "vacation" means "PTO"), but deterministic,
    instant, and good enough to test the whole pipeline without downloads.
    """

    def __init__(self, dim=1024):
        self.dim = dim

    def _bucket(self, feature):
        h = int(hashlib.md5(feature.encode()).hexdigest(), 16)
        return h % self.dim, (1.0 if (h >> 64) & 1 else -1.0)

    def embed(self, texts):
        out = np.zeros((len(texts), self.dim), dtype=np.float32)
        for row, text in enumerate(texts):
            toks = tokens(text)
            feats = toks + [a + "_" + b for a, b in zip(toks, toks[1:])]
            for f in feats:
                idx, sign = self._bucket(f)
                out[row, idx] += sign
            norm = np.linalg.norm(out[row])
            if norm:
                out[row] /= norm
        return out


class SentenceTransformerEmbedder:
    """Real semantic embeddings. Needs: pip install sentence-transformers (large download)."""

    def __init__(self, name=None):
        from sentence_transformers import SentenceTransformer

        self.model = SentenceTransformer(name or os.environ.get("EMBED_MODEL", "all-MiniLM-L6-v2"))

    def embed(self, texts):
        return np.asarray(self.model.encode(texts, normalize_embeddings=True), dtype=np.float32)


def make_embedder():
    mode = os.environ.get("EMBED_MODE", "hash")
    return SentenceTransformerEmbedder() if mode == "st" else HashingEmbedder()
