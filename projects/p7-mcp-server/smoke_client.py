"""Start the server as a subprocess and talk MCP to it, like Claude Desktop would."""
import asyncio
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    params = StdioServerParameters(command=sys.executable, args=["crm_server.py"])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print("tools:", [t.name for t in tools.tools])
            resources = await session.list_resources()
            print("resources:", [str(r.uri) for r in resources.resources])
            result = await session.call_tool("search_customers", {"query": "trial"})
            print("search_customers(trial):", result.content[0].text)
            summary = await session.read_resource("crm://pipeline/summary")
            print(summary.contents[0].text)


if __name__ == "__main__":
    asyncio.run(main())
