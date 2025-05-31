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
    disaster: Dict[str, Any]
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
        '  "disaster": { ... },\n'
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

async def get_agent_response(task_request, task_id):
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
    REQUEST_ASSIGN_AGENT = ""
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id", str(uuid.uuid4()))

    try:
        response = asyncio.run(get_agent_response(task_request, task_id))
        response_format = response['content']
        response_format_dict = response_format.model_dump()
        
        # Add additional processing if needed
        response["task_id"] = task_id
        response["agent"] = "ResourceTrackingAgent"

        response_task = {
            "resource_tracking_agent": {
                "id": task_id,
                "status": "resource-tracking-agent-completed",
                "agent": "resource-tracking-agent",
                "initial_request": task_request.get("message", {}),
                "next-agent": "resource-assign-agent",
                "message": "",
                "resource-tracking-agent-response": [
                    {
                        "role": "resource-tracking-agent",
                        "response": response_format_dict,
                    }

                ]
                # "messages": [
                #     task_request.get("message", {}),
                #     {
                #         "role": "agent",
                #         "parts": [{"text": response_format_dict}]
                #     }
                # ]
            }
        }

        print(f"Forwarding task {task_id} response is {response_task}")
        target_agent_url = REQUEST_ASSIGN_AGENT
        target_send_url = f"{target_agent_url}/tasks/send"

        try:
            response = requests.post(target_send_url, json=response_task, timeout=60)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error forwarding task {task_id}: {e}")
            error_response_task = {
                "request-verify-agent": {
                    "id": task_id,
                    "status": {"state": "failed", "reason": f"Failed to contact downstream agent: {target_agent_url}"},
                    "role": "request-trackingg-agent",
                    "messages": [
                        task_request.get("message", {}),
                        {
                            "role": "request-tracking-agent",
                            "error": [{"text": f"Error contacting target agent at {target_agent_url}. Details: {e}"}]
                        }
                    ]
                }
            }
            return jsonify(error_response_task), 502

        return jsonify(response_task.json())


    except Exception as e:
        print(f"Error tracking agent {task_id}: {e}")
        error_response_task = {
            "request-tracking-agent": {
                "id": task_id,
                "status": {"state": "failed", "reason": f"Agent processing failed: {e}"},
                "role": "request-tracking-agent",
                "messages": [
                    task_request.get("message", {}),
                    {
                        "role": "request-tracking-agent",
                        "error": [{"text": f"RAG agent failed. Details: {e}"}]
                    }
                ]
            }
        }
        return jsonify(error_response_task), 500

    return jsonify(response)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5012))
    print(f"Request Tracking Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port)