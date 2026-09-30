# Project 6: tool-calling order-support agent

## Goal
Build a small support agent that answers questions like "Where is my order A1001?" by calling three tools (`get_order`, `track_shipment`, `search_policy`) against a local JSON data store. The agent loop is written by hand so you can see every step: ask the model, run the tools it asks for, send results back, repeat until it answers or hits an iteration cap.

## What you will learn
- The Anthropic Messages API tool-use contract: `tools` schemas, `tool_use` blocks, `tool_result` blocks, `stop_reason`.
- Why an agent needs an iteration cap, argument validation and a trace log.
- How a fake model (`LLM_MODE=fake`) lets you test agent logic offline, deterministically, for free.

## Prerequisites
- Python 3.10 or newer, a terminal, basic Python (functions, dicts, JSON).
- Optional: an Anthropic API key for real mode.

## Layout
```
p6-tool-agent/
  agent/
    __init__.py
    tools.py      # tool schemas, validation, implementations
    llm.py        # RealLLM (Anthropic SDK) and FakeLLM (offline)
    loop.py       # the agent loop + trace log
  data/store.json # fake orders, shipments, policies
  tests/          # pytest tests (run offline)
  main.py         # command line entry point
  requirements.txt
  .env.example
```

## Setup
macOS / Linux:
```bash
cd p6-tool-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Windows PowerShell:
```powershell
cd p6-tool-agent
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Run (offline fake mode, the default)
```bash
python main.py "Where is my order A1001?"
```
Expected:
```
  [step 1] get_order({'order_id': 'A1001'})
  [step 2] track_shipment({'tracking_number': 'TRK-555001'})

Answer: Order A1001 is shipped (USB-C cable, Phone case). FastShip shows it in transit, last scan Denver hub, ETA 2026-09-29.
Steps: 3  |  trace appended to trace.jsonl
```
Open `trace.jsonl` to see one JSON line per step.

## Run with the real API
macOS / Linux:
```bash
export LLM_MODE=real ANTHROPIC_API_KEY=your-key MODEL=claude-sonnet-5
python main.py "My order A1003 arrived damaged, what can I do?"
```
Windows PowerShell:
```powershell
$env:LLM_MODE="real"; $env:ANTHROPIC_API_KEY="your-key"; $env:MODEL="claude-sonnet-5"
python main.py "My order A1003 arrived damaged, what can I do?"
```
The model id comes only from `MODEL`; nothing is hard-coded. Never commit your key.

## Test
```bash
python -m pytest -q
```
Expected: `13 passed`. Tests always use the fake model, so they need no key and no network.

## Stretch goals
1. Add a `cancel_order` tool that only works when status is `processing`, and require a "confirm" step before it runs (human in the loop).
2. Swap `data/store.json` for SQLite and use parameterized queries.
3. Record token usage (`response.usage`) per step in the trace and print total cost per question.
4. Build a 10-question eval: expected tool sequence per question, run it in fake and real mode, compare.
