import asyncio
from typing import Any, Dict, Literal
from flask import Flask, json, request, jsonify
from dotenv import load_dotenv
import os
import uuid
import requests
import json
from pydantic import BaseModel
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage

load_dotenv()

memory = MemorySaver()
app = Flask(__name__)

class ResourceTrackingResponse(BaseModel):
    disaster_requests: Dict[str, Any]
    resources: list[Dict[str, Any]]
    status: Literal['success', 'error'] = 'success'
    message: str

class ResourceTrackingAgent:
    AGENT_CARD = {
        "name": "RESOURCE_TRACKING_AGENT",
        "title": "Resource Tracking Agent",
        "description": "Track resources near disaster locations",
        "url": "http://localhost:5012",
        "version": "1.0",
        "capabilities": {
            "streaming": False,
            "pushNotifications": False
        }
    }

    SYSTEM_INSTRUCTION = (
        "You are a resource tracking agent. Your task is to find resource centers near verified disaster locations. "
        "Use the track_resources tool with the disaster ID, latitude, and longitude from the verified disaster data. "
        "Respond with the disaster details and matching resource centers in JSON format. "
        "If parameters are missing, return an error. "
        "Response format:\n"
        "{\n"
        '  "disaster_requests": { ... },\n'
        '  "resources": [ ... ],\n'
        '  "status": "success|error",\n'
        '  "message": "..."\n'
        "}"
    )

    def __init__(self, tools):
        self.llm = ChatOllama(model="llama3.1:8b", temperature=0.2)
        self.tools = tools
        self.graph = create_react_agent(
            self.llm,
            tools=self.tools,
            checkpointer=memory,
            prompt=self.SYSTEM_INSTRUCTION,
        )

    async def invoke(self, query: str, sessionId: str) -> Dict[str, Any]:
        config = {'configurable': {'thread_id': sessionId}}
        response = await self.graph.ainvoke({'messages': [('user', query)]}, config)
        return self._parse_response(response)

    def _parse_response(self, response) -> Dict[str, Any]:
        last_message = response['messages'][-1]
        if isinstance(last_message, AIMessage) and last_message.content:
            content = last_message.content
            
            # Handle JSON extraction from different formats
            if content.startswith('```json') and content.endswith('```'):
                content = content[7:-3].strip()
            elif content.startswith('{') and content.endswith('}'):
                content = content.strip()
            
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return {
                    "status": "error",
                    "message": "Invalid JSON response format",
                    "content": content
                }
        return {
            "status": "error",
            "message": "No valid response generated"
        }

@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(ResourceTrackingAgent.AGENT_CARD)

async def process_task(task_request: Dict[str, Any], task_id: str) -> Dict[str, Any]:
    try:
        # Extract verified disaster data from previous agent
        verified_data = task_request.get("request-verify-agent-response", {})
        
        # Extract disaster parameters
        disaster_id = verified_data.get("disaster_id")
        lat = verified_data.get("latitude")
        lng = verified_data.get("longitude")
        
        # Prepare query for agent
        query = {
            "disaster_id": disaster_id,
            "latitude": lat,
            "longitude": lng,
            "verification_status": verified_data.get("verification_status", "")
        }
        
        print(f"Resource Tracking Agent processing task {task_id}")
        client = MultiServerMCPClient({
            "track-resources": {
                "transport": "stdio",
                "command": "python",
                "args": ["disaster_agent_system/mcps/resource_track.py"]  # Update with actual path
            }
        })
        tools = await client.get_tools()
        agent = ResourceTrackingAgent(tools)
        return await agent.invoke(json.dumps(query), task_id)
        
    except Exception as e:
        print(f"Error processing task {task_id}: {e}")
        return {
            "status": "error",
            "message": f"Processing error: {str(e)}"
        }

@app.post("/tasks/send")
def handle_task():
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id", str(uuid.uuid4()))
    response = asyncio.run(process_task(task_request, task_id))
    
    # Add additional processing if needed
    response["task_id"] = task_id
    response["agent"] = "ResourceTrackingAgent"
    
    return jsonify(response)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5012))
    app.run(host="0.0.0.0", port=port)