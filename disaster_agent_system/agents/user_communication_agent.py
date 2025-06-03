import asyncio
import datetime
import os
from typing import Literal
from flask import Flask, request, jsonify
from pydantic import BaseModel
from disaster_agent_system.models.models import DisasterRequestResponseFormat
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

app = Flask(__name__)
memory = MemorySaver()

class UserSummary(BaseModel):
    status : Literal["pending", "completed", "error"]
    title: str
    description: str
    

class UserCommunicationAgent:
    AGENT_CARD = {
        "name": "REQUEST_VERIFY_AGENT",
        "title": "Request Verify Agent",
        "description": "Verify the disaster request information provided by the user.",
        "url": "http://localhost:5011",
        "version": "1.0",
        "capabilities": {
            "streaming": False,
            "pushNotifications": False
        }
    }
    SYSTEM_INSTRUCTION = (
        '''
        You are a Summary and Communication Agent for disaster requests and resources allocated to those requests.
            Your tasks are:
            - Receive disaster request data and resources tracked provided by the resource tracking agent.
            - Create a summary of the disaster request and allocated resources.
            - Extract the mobile phone number from the disaster request data.
            - Compose a message that includes the summary title and a brief description combining the disaster request details and allocated resources.
            - The summary and message should include the following fields:
            - status: The status of the disaster request (pending, completed, error)
            - title: The title of the disaster request
            - description: A brief description of the disaster request with allocated resources
            - phone: The mobile phone number extracted from the disaster request data
            - message: The combined text message to be sent via SMS, including title and description

            The output should be structured in the following JSON format:

            {
            "status": "pending",
            "title": "Disaster Request Title",
            "description": "Brief description of the disaster request with allocated resources.",
            "phone": "+1234567890",
            "message": "Disaster Request Title\nBrief description of the disaster request with allocated resources."
            }

        '''
    )
    def __init__(self, tools):
        self.llm = ChatOllama(model="qwen3:4b", temperature=0.8)
        self.graph = create_react_agent(self.llm, tools=tools, checkpointer=memory,
                                        prompt=self.SYSTEM_INSTRUCTION,
                                        response_format=UserSummary)

    async def invoke(self, query, sessionId):
        config = {'configurable': {'thread_id': sessionId}}
        final_state = await self.graph.ainvoke({"messages": [("user", query)]}, config=config)
        return self.get_agent_response(final_state)

    def get_agent_response(self, state):
        structured_response = state.get("structured_response")
        if structured_response and isinstance(structured_response, UserSummary):
            return {
                'is_task_complete': True,
                'content': structured_response.model_dump(),
            }
        # Return error format if structured response is missing or wrong
        return {
            'is_task_complete': False,
            'content': {
                "status": "error",
                "title": "",
                "description": "Failed to generate a valid summary response.",
            }
        }

@app.get("/.well-known/agent.json")
def get_user_agent_card():
    return jsonify(UserCommunicationAgent.AGENT_CARD)

async def get_user_agent_response(task_request, task_id):
    # try:
    #     intake_data = task_request["request-intake-agent"]
    #     previous_response = intake_data.get("response", {})
    # except (KeyError, TypeError) as e:
    #     # Error if intake data isn't present
    #     return {
    #         "error": "Bad message format", 
    #         "content": {
    #             "status": "error",
    #             "title": "Invalid Request",
    #             "description": f"Error processing request: {str(e)}"
    #     }}
    try:
        # Initialize tools and agent
        client = MultiServerMCPClient(
        {
            "message-send": {
                "transport": "stdio", 
                "command": "python",
                "args": ["disaster_agent_system/mcps/message_mcp.py"]
            }
        })
        tools = await client.get_tools()
        print(f"Loaded {len(tools)} tools from MCP servers.")
        print("Creating Request Verify Agent...")
        agent = UserCommunicationAgent(tools)
        # Pass the intake response as instruction text
        return await agent.invoke(str(task_request), task_id)
    except Exception as e:
        # Return error content on exception
        return {
            "error": str(e), 
            "content": {
                "status": "error",
                "title" : "",
                "description" : ""
        }}

@app.post("/tasks/send")
def handle_user_task():
    task_request = request.get_json()
    print(f"Received task request for User Communication Agent: {task_request}")
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("task_id", "")
    intake_data = next((agent_resp.get("response") for agent_resp in task_request.get("agent_responses", []) if agent_resp.get("agent") == "resource-tracking-agent"), None)
    print(f"Processing task {task_id} with intake data: {intake_data}")
    try:
        agent_response = asyncio.run(get_user_agent_response(intake_data, task_id))
        print(f"User Communication Agent response for task {task_id}: {agent_response}")
    except Exception as e:
        agent_response = {
            "error": str(e), 
            "content": {
                "status" : "error",
                "title" : "",
                "description" : ""
                
        }}

    # If the agent did not complete successfully, return HTTP 500 with status="error"
    if not agent_response.get("is_task_complete", False):
        response = jsonify({
            "user-communication-agent": {
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
        "user-communication-agent": {
            "id": task_id,
            "status": "success",
            "response": agent_response.get("content", {})
        },
        "agent_responses": task_request.get("agent_responses", [])
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5015))
    print(f"User Communication Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 
