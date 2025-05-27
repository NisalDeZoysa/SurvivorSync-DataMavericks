import asyncio
import subprocess
import time
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent

# Setup the Ollama Qwen3:4b model
llm = ChatOllama(
    model="qwen3:4b",
    temperature=0.7,
    # You can add more params here if needed
)

async def main():
    try:
        # Start MCP servers
        print("Starting MCP servers...")
        math_process = subprocess.Popen(
            ["python", "math.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        web_search_process = subprocess.Popen(
            ["python", "brave_search_mcp_server.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # Wait briefly to ensure servers are ready
        time.sleep(2)

        print("Connecting to MCP servers...")
        client = MultiServerMCPClient(
            {
                "math": {
                    "transport": "stdio",
                    "command": "python",
                    "args": ["math.py"]
                },
                "web-search": {
                    "transport": "stdio",
                    "command": "python",
                    "args": ["brave_search_mcp_server.py"]
                }
            }
        )

        # Load tools from the MCP servers
        print("Loading tools...")
        tools = await client.get_tools()
        print(f"Tools loaded: {[tool.name for tool in tools]}")

        # Create a ReAct agent
        print("Creating ReAct agent...")
        agent = create_react_agent(llm, tools)

        # Run a prompt that uses the tools
        print("Sending prompt to agent...")
        response = await agent.ainvoke(
            {"messages": [{"role": "user", "content": "what is the weather in NYC? Keep It Simple and Only GIve Me One Short Answer"}]}
        )

        print("\n=== Agent Response ===")
        for msg in response['messages']:
            print(msg.content)

    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

    finally:
        # Clean up: terminate MCP subprocesses
        print("\nTerminating MCP servers...")
        math_process.terminate()
        web_search_process.terminate()
        math_process.wait()
        web_search_process.wait()
        print("MCP servers terminated.")

if __name__ == "__main__":
    asyncio.run(main())
