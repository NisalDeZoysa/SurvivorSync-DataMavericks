import os
import requests
from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

# Load env vars
load_dotenv()
mcp = FastMCP("web-search")

BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")

if not BRAVE_API_KEY:
    raise ValueError("Missing BRAVE_API_KEY in environment variables")

@mcp.tool()
def search(query: str) -> dict:
    """Performs a web search using the Brave Search API."""
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
    }
    params = {"q": query, "count": 10}

    try:
        response = requests.get(
            "https://api.search.brave.com/res/v1/web/search",
            headers=headers,
            params=params,
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"Brave API request failed: {e}"}


if __name__ == "__main__":
    mcp.run()
