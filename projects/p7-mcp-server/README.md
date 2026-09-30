# Project 7: MCP server for a mock CRM

## Goal
Wrap a tiny fake CRM in a Model Context Protocol (MCP) server so any MCP client (Claude Desktop, Claude Code, MCP Inspector) can search customers, read a record, add a note, and read a pipeline summary. You write the tools once; every MCP client can use them.

## What you will learn
- MCP basics: a server exposes tools (actions the model can call) and resources (read-only data the client can load).
- Using the official Python MCP SDK's `FastMCP` class: type hints and docstrings become the tool schema.
- The stdio transport, and why you must never `print()` to stdout in a stdio server.
- Testing: unit-test plain functions, then check the protocol with MCP Inspector and a small client.

## Prerequisites
- Python 3.10+.
- Optional: Node.js 18+ (for MCP Inspector via `npx`), Claude Desktop (macOS or Windows).

## Layout
```
p7-mcp-server/
  crm_data.py        # the mock CRM (plain Python, no MCP)
  crm_server.py      # FastMCP server: 3 tools + 1 resource
  smoke_client.py    # a tiny MCP client that starts the server and calls it
  tests/test_crm.py  # unit tests call the tool functions directly
  claude_desktop_config.example.json
  requirements.txt
```

## Setup
macOS / Linux:
```bash
cd p7-mcp-server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Windows PowerShell:
```powershell
cd p7-mcp-server
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

SDK version note: `requirements.txt` pins `mcp<2` because this project uses `from mcp.server.fastmcp import FastMCP`. In mcp 2.x that class was renamed to `MCPServer` (`from mcp.server.mcpserver import MCPServer`) and other APIs changed. Porting is a stretch goal.

## Run
```bash
python smoke_client.py
```
Expected (server logs go to stderr and are mixed in):
```
tools: ['search_customers', 'get_customer', 'add_note']
resources: ['crm://pipeline/summary']
search_customers(trial): { "id": "C002", "name": "Globex Sample Ltd", ... }
# Pipeline summary
- trial: 1 (Globex Sample Ltd)
...
Total ARR: $165,000
```
`python crm_server.py` on its own just waits silently: it is waiting for a client on stdin.

## Test with MCP Inspector
```bash
npx @modelcontextprotocol/inspector python crm_server.py
```
A browser tab opens. Click Connect, open the Tools tab, run `search_customers` with `query = acme`, then open Resources and read `crm://pipeline/summary`. Try `get_customer` with `C999` to see an error result. Command-line check without a browser:
```bash
npx @modelcontextprotocol/inspector --cli python crm_server.py --method tools/list
```

## Connect to Claude Desktop
1. Open the config file (Claude Desktop: Settings, Developer, Edit Config):
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
2. Add the block from `claude_desktop_config.example.json`, using absolute paths. On Windows the python path is like `C:\\Users\\you\\p7-mcp-server\\.venv\\Scripts\\python.exe` (double backslashes in JSON).
3. Fully quit and reopen Claude Desktop. Ask: "Which customers are in negotiation, and what notes do we have on them?"
4. If it does not appear, check the MCP logs (macOS: `~/Library/Logs/Claude/mcp*.log`, Windows: `%APPDATA%\Claude\logs`).

## Unit tests
```bash
python -m pytest -q
```
Expected: `7 passed`. The tests call the decorated functions directly (FastMCP 1.x returns the original function) and also ask the server to list its tools and resources.

## Stretch goals
1. Port to mcp 2.x (`MCPServer`) and make the tests pass again.
2. Add a resource template `crm://customers/{customer_id}` and a prompt `account_brief`.
3. Replace the in-memory dicts with SQLite and make `add_note` require a `confirm: bool` argument.
4. Run it over Streamable HTTP (`mcp.run(transport="streamable-http")`) and add a bearer-token check.
