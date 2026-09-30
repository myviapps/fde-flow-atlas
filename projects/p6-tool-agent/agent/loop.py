"""The agent loop: ask the model, run the tools it requests, repeat until done or capped."""
import json
import time

from agent.tools import TOOLS, execute_tool, load_store

SYSTEM = (
    "You are an order-support agent for an online store. Use the tools to look up facts; "
    "never guess order status, tracking or policy details. If a tool returns an error, "
    "tell the customer plainly what is missing. Keep answers to 2-4 sentences."
)


class Trace:
    """Collects one JSON event per step; optionally appends them to a .jsonl file."""

    def __init__(self, path=None):
        self.path, self.events = path, []

    def log(self, kind, **data):
        event = {"t": round(time.time(), 3), "kind": kind, **data}
        self.events.append(event)
        if self.path:
            with open(self.path, "a", encoding="utf-8") as f:
                f.write(json.dumps(event) + "\n")


def run_agent(question, llm, store=None, max_iterations=6, trace=None):
    store = store or load_store()
    trace = trace or Trace()
    messages = [{"role": "user", "content": question}]
    trace.log("user", text=question)

    for step in range(1, max_iterations + 1):
        response = llm.create(system=SYSTEM, messages=messages, tools=TOOLS)
        trace.log("model", step=step, stop_reason=response.stop_reason)
        # Keep the assistant turn exactly as returned (it may hold tool_use and thinking blocks).
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            text = " ".join(b.text for b in response.content if b.type == "text").strip()
            if response.stop_reason != "end_turn":
                text = text or f"Stopped early ({response.stop_reason}). A human will follow up."
            trace.log("final", step=step, text=text)
            return {"answer": text, "steps": step, "messages": messages, "trace": trace.events}

        results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            output, is_error = execute_tool(store, block.name, block.input)
            trace.log("tool", step=step, name=block.name, input=block.input, is_error=is_error, output=output[:300])
            results.append({"type": "tool_result", "tool_use_id": block.id, "content": output, "is_error": is_error})
        messages.append({"role": "user", "content": results})  # all results in ONE user message

    trace.log("capped", max_iterations=max_iterations)
    answer = "Sorry, I could not finish this request. I have passed it to a human agent."
    return {"answer": answer, "steps": max_iterations, "messages": messages, "trace": trace.events}
