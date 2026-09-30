"""Two interchangeable model clients: the real Anthropic API, and an offline fake.

Both expose create(system, messages, tools) and return an object with
.stop_reason and .content (a list of blocks with .type), like the SDK does.
"""
import json
import os
import re
from types import SimpleNamespace


class RealLLM:
    def __init__(self):
        import anthropic  # imported here so fake mode works without the package

        self.model = os.environ.get("MODEL")
        if not self.model:
            raise RuntimeError("Set MODEL (see .env.example) to use LLM_MODE=real")
        self.client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY

    def create(self, system, messages, tools):
        return self.client.messages.create(
            model=self.model, max_tokens=16000, system=system, tools=tools, messages=messages
        )


TRACK_WORDS = {"where", "track", "tracking", "arrive", "eta", "delivered"}
POLICY_WORDS = {"return", "refund", "policy", "cancel", "damaged", "broken", "shipping"}


def _results_so_far(messages):
    """Map tool name -> (parsed result or None, is_error) from the conversation."""
    names, out = {}, {}
    for msg in messages:
        if isinstance(msg["content"], str):
            continue
        for block in msg["content"]:
            kind = block["type"] if isinstance(block, dict) else block.type
            if kind == "tool_use":
                names[block.id] = block.name
            elif kind == "tool_result":
                ok = not block.get("is_error", False)
                out[names[block["tool_use_id"]]] = (json.loads(block["content"]) if ok else None, not ok)
    return out


class FakeLLM:
    """Rule-based stand-in that emits the same block shapes as the real API."""

    def create(self, system, messages, tools):
        question = messages[0]["content"]
        words = set(re.findall(r"[a-z]+", question.lower()))
        order_ids = re.findall(r"\bA\d{4}\b", question)
        done = _results_so_far(messages)
        call_id = f"toolu_fake_{len(messages)}"

        def tool(name, **args):
            block = SimpleNamespace(type="tool_use", id=call_id, name=name, input=args)
            return SimpleNamespace(stop_reason="tool_use", content=[block])

        if order_ids and "get_order" not in done:
            return tool("get_order", order_id=order_ids[0])
        order, order_err = done.get("get_order", (None, False))
        if words & TRACK_WORDS and order and order.get("tracking") and "track_shipment" not in done:
            return tool("track_shipment", tracking_number=order["tracking"])
        if words & POLICY_WORDS and "search_policy" not in done:
            return tool("search_policy", query=question[:200])

        lines = []
        if order_err:
            lines.append("I could not find that order. Please double-check the order id.")
        elif order:
            lines.append(f"Order {order['order_id']} is {order['status']} ({', '.join(order['items'])}).")
        ship = done.get("track_shipment", (None, False))[0]
        if ship:
            lines.append(f"{ship['carrier']} shows it {ship['status']}, last scan {ship['last_scan']}, ETA {ship['eta']}.")
        policy = done.get("search_policy", (None, False))[0]
        if policy and policy["results"]:
            top = policy["results"][0]
            lines.append(f"Policy ({top['title']}): {top['text']}")
        if not lines:
            lines.append("I can help with orders, shipments and store policies. What is your order id?")
        return SimpleNamespace(stop_reason="end_turn", content=[SimpleNamespace(type="text", text=" ".join(lines))])


def make_llm():
    return RealLLM() if os.environ.get("LLM_MODE", "fake") == "real" else FakeLLM()
