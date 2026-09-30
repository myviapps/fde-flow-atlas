"""The three tools the agent can call, their JSON schemas, and argument validation."""
import json
import re
from pathlib import Path

STORE_PATH = Path(__file__).resolve().parent.parent / "data" / "store.json"
ORDER_ID = re.compile(r"^A\d{4}$")
TRACKING_ID = re.compile(r"^TRK-\d{6}$")

# Tool definitions in the shape the Anthropic Messages API expects.
TOOLS = [
    {
        "name": "get_order",
        "description": "Look up one order by its id (format A1234). Returns status, items, total and tracking number.",
        "input_schema": {
            "type": "object",
            "properties": {"order_id": {"type": "string", "description": "Order id like A1001"}},
            "required": ["order_id"],
            "additionalProperties": False,
        },
    },
    {
        "name": "track_shipment",
        "description": "Get carrier status for a tracking number (format TRK-123456). Use get_order first to find it.",
        "input_schema": {
            "type": "object",
            "properties": {"tracking_number": {"type": "string"}},
            "required": ["tracking_number"],
            "additionalProperties": False,
        },
    },
    {
        "name": "search_policy",
        "description": "Search store policies (returns, shipping, damaged items, cancellations) by keywords.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "A few keywords"}},
            "required": ["query"],
            "additionalProperties": False,
        },
    },
]


class ToolError(Exception):
    """Raised for bad arguments or missing records. Sent back to the model as is_error."""


def load_store(path=STORE_PATH):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def validate(name, args):
    """Check the arguments against the schema before touching any data."""
    spec = next((t for t in TOOLS if t["name"] == name), None)
    if spec is None:
        raise ToolError(f"unknown tool: {name}")
    if not isinstance(args, dict):
        raise ToolError("arguments must be an object")
    schema = spec["input_schema"]
    missing = [k for k in schema["required"] if k not in args]
    extra = [k for k in args if k not in schema["properties"]]
    if missing or extra:
        raise ToolError(f"missing={missing} unexpected={extra}")
    for key, value in args.items():
        if not isinstance(value, str) or not value.strip():
            raise ToolError(f"{key} must be a non-empty string")
    if name == "get_order" and not ORDER_ID.match(args["order_id"]):
        raise ToolError("order_id must look like A1234")
    if name == "track_shipment" and not TRACKING_ID.match(args["tracking_number"]):
        raise ToolError("tracking_number must look like TRK-123456")
    if name == "search_policy" and len(args["query"]) > 200:
        raise ToolError("query too long")


def get_order(store, order_id):
    order = store["orders"].get(order_id)
    if order is None:
        raise ToolError(f"no order {order_id}")
    return {"order_id": order_id, **order}


def track_shipment(store, tracking_number):
    shipment = store["shipments"].get(tracking_number)
    if shipment is None:
        raise ToolError(f"no shipment {tracking_number}")
    return {"tracking_number": tracking_number, **shipment}


def _words(text):
    """Lowercase words longer than 2 letters, with a crude plural/past-tense trim."""
    return {re.sub(r"(ed|s)$", "", w) for w in re.findall(r"[a-z]+", text.lower()) if len(w) > 2}


def search_policy(store, query):
    words = _words(query)
    scored = []
    for p in store["policies"]:
        text_words = _words(p["title"] + " " + p["text"])
        score = len(words & text_words) + (3 if p["id"] in words else 0)
        if score:
            scored.append((score, p))
    scored.sort(key=lambda pair: -pair[0])
    return {"results": [p for _, p in scored[:2]]}


FUNCTIONS = {"get_order": get_order, "track_shipment": track_shipment, "search_policy": search_policy}


def execute_tool(store, name, args):
    """Validate, run, and return (result_text, is_error). Never raises."""
    try:
        validate(name, args)
        result = FUNCTIONS[name](store, **args)
        return json.dumps(result), False
    except ToolError as exc:
        return f"Error: {exc}", True
