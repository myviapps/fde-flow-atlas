"""Priority classification. Start with rules; add an LLM only if you have time left."""
LEVELS = ["low", "medium", "high"]


def classify_rules(subject: str, body: str, tier: str) -> str:
    # TODO: return "high" for outage / down / data loss / security / cannot log in,
    # "medium" for error / bug / slow / failed / timeout, else "low".
    # Enterprise tier bumps the result up one level (low -> medium, medium -> high).
    raise NotImplementedError


def classify(subject: str, body: str, tier: str) -> tuple[str, str]:
    """Return (priority, method). Stretch: LLM_MODE=real tries an LLM, falls back to rules."""
    return classify_rules(subject, body, tier), "rules"
