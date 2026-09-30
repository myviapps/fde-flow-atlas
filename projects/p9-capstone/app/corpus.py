"""Synthetic claims-policy documents plus a tiny vector retriever with ACL filters.

The retriever mirrors what pgvector would do: embed text into a fixed-size vector,
filter rows by access groups, then rank by cosine similarity.
"""
import math
import re
import zlib

DIM = 256
STOPWORDS = set(
    "a an the is are was were be to of in on for and or if my i do does can what how "
    "when who which it this that with from by at as up any not have has you your me".split()
)

DOCS = [
    {"id": "POL-AUTO-01", "acl": ["public"], "text": "Auto collision claims must be reported within 30 days of the accident. A police report number is required when another vehicle is involved. The deductible applies before any payout."},
    {"id": "POL-HOME-02", "acl": ["public"], "text": "Home water damage from a sudden burst pipe is covered. Gradual leaks are excluded. Flood from rising surface water is excluded unless the flood rider was purchased."},
    {"id": "POL-HOME-03", "acl": ["public"], "text": "Theft of personal property from the home is covered up to 5000 dollars per item. A police report is required within 7 days of discovering the theft."},
    {"id": "POL-TRAVEL-04", "acl": ["public"], "text": "Trip cancellation is covered when the traveler or an immediate family member has a documented illness. Cancellation for a change of mind is not covered."},
    {"id": "ADJ-AUTH-05", "acl": ["adjuster"], "text": "Adjusters can approve claims up to 25000 dollars without supervisor sign-off. Claims above 25000 dollars require approval from a senior adjuster."},
    {"id": "ADJ-RENTAL-06", "acl": ["adjuster"], "text": "Rental car reimbursement is paid at up to 40 dollars per day for a maximum of 30 days while the insured vehicle is being repaired."},
    {"id": "ADJ-SUBRO-07", "acl": ["adjuster"], "text": "When another party is at fault the adjuster opens a subrogation file within 14 days to recover the payout from the at-fault insurer."},
    {"id": "FRAUD-08", "acl": ["fraud"], "text": "Flag a claim for special investigation when the loss is reported more than 60 days late, the policy is less than 30 days old, or the claimant has three or more claims in 12 months."},
]


def tokens(text: str) -> list[str]:
    """Lowercase, drop stopwords, and apply a crude suffix stemmer."""
    out = []
    for w in re.findall(r"[a-z0-9]+", text.lower()):
        if w in STOPWORDS:
            continue
        for suffix in ("ing", "ed", "s"):
            if w.endswith(suffix) and len(w) > len(suffix) + 3:
                w = w[: -len(suffix)]
                break
        out.append(w)
    return out


def embed(text: str) -> list[float]:
    """Hashing-trick bag of words, L2-normalised. Swap for a real embedding model later."""
    vec = [0.0] * DIM
    for t in tokens(text):
        vec[zlib.crc32(t.encode()) % DIM] += 1.0
    norm = math.sqrt(sum(v * v for v in vec)) or 1.0
    return [v / norm for v in vec]


INDEX = [(doc, embed(doc["text"])) for doc in DOCS]


def search(query: str, groups: list[str], k: int = 3) -> list[dict]:
    """ACL filter first (like WHERE acl && :groups), then cosine ranking."""
    q = embed(query)
    allowed = [(d, v) for d, v in INDEX if set(d["acl"]) & set(groups)]
    scored = [(sum(a * b for a, b in zip(q, v)), d) for d, v in allowed]
    scored.sort(key=lambda x: x[0], reverse=True)
    return [d for score, d in scored[:k] if score > 0]
