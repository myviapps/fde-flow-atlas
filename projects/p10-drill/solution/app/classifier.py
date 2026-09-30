"""Priority classification: transparent rules by default, optional LLM with rule fallback."""
import os

LEVELS = ["low", "medium", "high"]
HIGH_WORDS = ("outage", "is down", "data loss", "security", "breach", "cannot log in", "can't log in")
MEDIUM_WORDS = ("error", "bug", "slow", "failed", "timeout", "broken")


def classify_rules(subject: str, body: str, tier: str) -> str:
    text = f"{subject} {body}".lower()
    level = 2 if any(w in text for w in HIGH_WORDS) else 1 if any(w in text for w in MEDIUM_WORDS) else 0
    if tier == "enterprise":  # contract says enterprise tickets get bumped one level
        level = min(level + 1, 2)
    return LEVELS[level]


def classify_llm(subject: str, body: str, tier: str) -> str:
    import anthropic

    client = anthropic.Anthropic()
    msg = client.messages.create(
        model=os.environ["MODEL"], max_tokens=5,
        messages=[{"role": "user", "content":
                   f"Classify this support ticket priority as low, medium or high. Customer tier: {tier}.\n"
                   f"Subject: {subject}\nBody: {body}\nReply with one word."}],
    )
    return msg.content[0].text.strip().lower()


def classify(subject: str, body: str, tier: str) -> tuple[str, str]:
    """Return (priority, method). Any LLM failure or odd output falls back to rules."""
    if os.getenv("LLM_MODE", "fake") == "real":
        try:
            label = classify_llm(subject, body, tier)
            if label in LEVELS:
                return label, "llm"
        except Exception:
            pass
    return classify_rules(subject, body, tier), "rules"
