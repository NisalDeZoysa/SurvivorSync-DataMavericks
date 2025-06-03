import os
import requests
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("web-search")

BRAVE_API_KEY = "BSAj0WMUi25G77DSmwBaAVWGVZ9HSHJ"

@mcp.tool()
def search(query: str) -> dict:
    """Performs a web search using the Brave Search API."""
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
        
    }
    params = {"q": query, "count": 10}
    response = requests.get("https://api.search.brave.com/res/v1/web/search", headers=headers, params=params)
    return response.json()

if __name__ == "__main__":
    mcp.run()
