"""MCP server exposing the mock CRM: 3 tools + 1 resource, over stdio.

Run directly:     python crm_server.py        (waits silently for an MCP client)
Inspect it:       npx @modelcontextprotocol/inspector python crm_server.py
"""
import logging
import sys

from mcp.server.fastmcp import FastMCP

import crm_data

# stdout carries the MCP protocol. Anything you print there corrupts it, so log to stderr.
logging.basicConfig(stream=sys.stderr, level=logging.INFO)
log = logging.getLogger("mock-crm")

mcp = FastMCP("mock-crm")


@mcp.tool()
def search_customers(query: str, limit: int = 5) -> list[dict]:
    """Find customers by part of their name, or by exact industry or stage
    (trial, negotiation, customer, churned). Returns id, name, stage, ARR, owner."""
    log.info("search_customers %r", query)
    return crm_data.search(query, limit)


@mcp.tool()
def get_customer(customer_id: str) -> dict:
    """Get one customer's full record and notes by id (like C001)."""
    return crm_data.get(customer_id)


@mcp.tool()
def add_note(customer_id: str, text: str) -> dict:
    """Append a short note (max 500 chars) to a customer. This changes data."""
    log.info("add_note %s", customer_id)
    return crm_data.add_note(customer_id, text)


@mcp.resource("crm://pipeline/summary")
def pipeline_summary() -> str:
    """Read-only markdown summary of the sales pipeline by stage."""
    return crm_data.pipeline_summary()


if __name__ == "__main__":
    mcp.run()  # stdio transport by default
