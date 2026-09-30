"""Command line entry point: python main.py "Where is my order A1001?" """
import os
import sys

from agent.llm import make_llm
from agent.loop import Trace, run_agent


def main():
    question = " ".join(sys.argv[1:]) or "Where is my order A1001?"
    trace = Trace(os.environ.get("TRACE_FILE", "trace.jsonl"))
    result = run_agent(question, make_llm(), trace=trace)
    for event in result["trace"]:
        if event["kind"] == "tool":
            flag = " (error)" if event["is_error"] else ""
            print(f"  [step {event['step']}] {event['name']}({event['input']}){flag}")
    print(f"\nAnswer: {result['answer']}")
    print(f"Steps: {result['steps']}  |  trace appended to {trace.path}")


if __name__ == "__main__":
    main()
