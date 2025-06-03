import asyncio
import datetime
import os
from flask import Flask, request, jsonify
from pydantic import BaseModel
from disaster_agent_system.models.models import DisasterRequestResponseFormat
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

app = Flask(__name__)
memory = MemorySaver()

class FRCommunicationResponse(BaseModel):
    notified_frs = list[int]
    status: str
    count = int
    

class FRCommunicationAgent:
    AGENT_CARD = {
        "name": "FIRST_RESPONDER_COMMUNICATION_AGENT",
        "title": "First Responder Communication Agent",
        "description": "First Responder Communication Agent",
        "url": "http://localhost:5011",
        "version": "1.0",
        "capabilities": {
            "streaming": False,
            "pushNotifications": False
        }
    }
    SYSTEM_INSTRUCTION = (
            "You are an intelligent First Responder Communication Agent. "
            "Your task is to create first responder notifications for disasters and allocated resources. "
            "Use the available tools to get disaster request details and nearby resource center information. "
            "For each relevant disaster, generate a JSON response in the following structure:\n\n"
            '''{
                "notified_frs": [<list of int>],  // Resource center IDs that are being notified
                "status": "pending" | "completed" | "error",  // Notification status
                "count": <int>,  // Number of responders notified
                "fr_notifications": [
                    {
                        "disasterRequestId": <int>,  // ID of the disaster request
                        "title": "<short title for the response>",  // Brief title of the notification
                        "date": "<ISO formatted date>",  // e.g., 2025-06-02
                        "description": "<message for the responders>",  // Message sent to the responders
                        "is_assigned": false  // By default, set to false
                    }
                ]
            }'''
            "Guidelines:\n"
            "- Use the disaster ID and its lat/long to call the `track_resources` tool.\n"
            "- Use the resource center IDs returned as `notified_frs`.\n"
            "- The `description` should mention the type of help needed and number of resources available.\n"
            "- The `title` should be short and related to the disaster type (e.g., 'Flood Response Needed').\n"
            "- If tool calls fail, return status='error' and set `notified_frs` to an empty list.\n"
            "- Use today's date as `date` (in ISO format).\n"
        )

    def __init__(self, tools):
        self.llm = ChatOllama(model="qwen3:4b", temperature=0.8)
        self.graph = create_react_agent(self.llm, tools=tools, checkpointer=memory,
                                        prompt=self.SYSTEM_INSTRUCTION,
                                        response_format=VerifiedResponseFormat)

    async def invoke(self, query, sessionId):
        config = {'configurable': {'thread_id': sessionId}}
        final_state = await self.graph.ainvoke({"messages": [("user", query)]}, config=config)
        return self.get_agent_response(final_state)

    def get_agent_response(self, state):
        structured_response = state.get("structured_response")
        if structured_response and isinstance(structured_response, VerifiedResponseFormat):
            return {
                'is_task_complete': True,
                'content': structured_response.model_dump(),
            }
        # Return error format if structured response is missing or wrong
        return {
            'is_task_complete': False,
            'content': {
                "help_needed_requests": [],
                "status": "error",
                "verification_status": "not_verified",
                "verification_message": "Failed to generate proper response"
            }
        }

@app.get("/.well-known/agent.json")
def get_verify_agent_card():
    return jsonify(RequestVerifyAgent.AGENT_CARD)

async def get_verify_agent_response(task_request, task_id):
    try:
        intake_data = task_request["request-intake-agent"]
        previous_response = intake_data.get("response", {})
    except (KeyError, TypeError) as e:
        # Error if intake data isn't present
        return {
            "error": "Bad message format", 
            "content": {
            "help_needed_requests": [],
            "status": "error",
            "verification_status": "not_verified",
            "verification_message": "Failed to extract intake data"
        }}
    try:
        # Initialize tools and agent
        client = MultiServerMCPClient(
        {
            "near-requests": {
                "transport": "stdio", 
                "command": "python",
                "args": ["disaster_agent_system/mcps/near_requests.py"]
            }
        })
        tools = await client.get_tools()
        print(f"Loaded {len(tools)} tools from MCP servers.")
        print("Creating Request Verify Agent...")
        agent = RequestVerifyAgent(tools)
        # Pass the intake response as instruction text
        return await agent.invoke(str(previous_response), task_id)
    except Exception as e:
        # Return error content on exception
        return {
            "error": str(e), 
            "content": {
            "help_needed_requests": [],
            "status": "error",
            "verification_status": "not_verified",
            "verification_message": f"Error: {str(e)}"
        }}

@app.post("/tasks/send")
def handle_verify_task():
    task_request = request.get_json()
    print(f"Received task request for Request Verify Agent: {task_request}")
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("task_id", "")
    intake_data = next((agent_resp.get("response") for agent_resp in task_request.get("agent_responses", []) if agent_resp.get("agent") == "request-intake-agent"), None)
    print(f"Processing task {task_id} with intake data: {intake_data}")
    try:
        agent_response = asyncio.run(get_verify_agent_response(intake_data, task_id))
        print(f"Request Verify Agent response for task {task_id}: {agent_response}")
    except Exception as e:
        agent_response = {
            "error": str(e), 
            "content": {
            "help_needed_requests": [],
            "status": "error",
            "verification_status": "not_verified",
            "verification_message": f"Error: {str(e)}"
        }}

    # If the agent did not complete successfully, return HTTP 500 with status="error"
    if not agent_response.get("is_task_complete", False):
        response = jsonify({
            "request-verify-agent": {
                "id": task_id,
                "status": "error",
                "response": agent_response.get("content", {})
            },
            "agent_responses": task_request.get("agent_responses", [])
        })
        response.status_code = 500
        return response

    # Success: return status="success"
    return jsonify({
        "request-verify-agent": {
            "id": task_id,
            "status": "success",
            "response": agent_response.get("content", {})
        },
        "agent_responses": task_request.get("agent_responses", [])
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5014))
    print(f"Request Intake Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 
