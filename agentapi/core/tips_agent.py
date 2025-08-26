import asyncio
import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()
app = Flask(__name__)
memory = MemorySaver()

class TipsAgent:
    AGENT_CARD = {
        "name": "TIPS_AGENT",
        "title": "Tips and General Question Answering Person",
        "description": "Provides safety tips and advice for disaster preparedness.",
        "url": "http://localhost:5003",
        "version": "2.0",
        "capabilities": {"streaming": False, "pushNotifications": False}
    }

    SYSTEM_INSTRUCTION = """
    You are an expert assistant specializing in safety tips and preparedness info 
    for weather, disasters, and health issues.

    Rules:
    - Identify disaster/general preparedness context
    - Provide actionable, concise safety/preparedness tips
    - If real-time info is needed, use the web-search MCP tool (if available)
    - Output must be plain text message only
    """

    def __init__(self, tools=None):
        self.llm = ChatOpenAI(model="gpt-4o-2024-08-06", temperature=0.6)
        self.graph = create_react_agent(
            self.llm,
            tools=tools or [],
            prompt=self.SYSTEM_INSTRUCTION,
        )

    async def invoke(self, query: str) -> str:
        state = await self.graph.ainvoke(
            {"messages": [{"role": "user", "content": query}]}
        )
        messages = state.get("messages", [])
        if messages:
            return messages[-1].content if hasattr(messages[-1], "content") else str(messages[-1])
        return "Sorry, I could not generate a response."


@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(TipsAgent.AGENT_CARD)


async def get_agent_response(task_request):
    try:
        user_text = task_request["message"]
    except Exception as e:
        return f"Bad message format: {e}"

    tools = []
    # Try to load MCP client but don't crash if it fails
    try:
        client = MultiServerMCPClient({
            "web-search": {
                "transport": "stdio",
                "command": "python",
                "args": ["brave_search_mcp_server.py"]
            }
        })
        tools = await client.get_tools()
    except Exception as e:
        print(f"[WARN] MCP not available, running without tools. Reason: {e}")

    try:
        agent = TipsAgent(tools=tools)
        return await agent.invoke(user_text)
    except Exception as e:
        return f"Agent error: {e}"


@app.post("/tasks/send")
def handle_task():
    task_request = request.get_json()
    if not task_request:
        return jsonify({"agent": "tips-agent", "message": "Invalid request"}), 400

    try:
        message = asyncio.run(get_agent_response(task_request))
        response_task = {"agent": "tips-agent", "message": message}
    except Exception as e:
        response_task = {"agent": "tips-agent", "message": f"Agent processing failed: {e}"}

    return jsonify(response_task)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    print(f"Tips Agent server running on {port}")
    app.run(host="0.0.0.0", port=port)
