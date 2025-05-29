import asyncio
from typing import Any, AsyncIterable, Dict, Literal
from flask import Flask, json, request, jsonify
from dotenv import load_dotenv
import os
import uuid
from pydantic import BaseModel
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage, ToolMessage
import requests
from disaster_agent_system.models.models import DisasterRequestResponseFormat

load_dotenv()


memory = MemorySaver()

app = Flask(__name__)

class VerifiedtResponseFormat(BaseModel):
    """Respond to the user in this format."""
    status : Literal['pending', 'completed','error'] = 'pending'
    verificaion_status: Literal['pending', 'verified', 'not_verified'] = 'pending'
    verification_message: str
    
class RequestVerifyAgent:

    # RAG Agent Card metadata
    AGENT_CARD = {
        "name": "REQUEST_VERIFY_AGENT",
        "title": "Request Verify Agent",
        "description": "Verify the disaster request information provided by the user.",
        "url": "http://localhost:5011",  # base URL where this agent is hosted
        "version": "1.0",
        "capabilities": {
            "streaming": False, # Assuming false based on existing server.py
            "pushNotifications": False
        }
    }

    SYSTEM_INSTRUCTION = (
        'You are an intelligent request verify agent.' 
        'Your task is to verify the disaster request information provided by the user and respond in the following JSON format.'
        'Use the available tools to verify the information.'
        'If the tool calling gives a value, set the status to "completed"'
        'If the return query count from request_count tool is greater than 2, set the verification_status to "verified".' 
        'If the return value from tool is less than 2, set the verification_status to "not_verified".'
        'verification_message should contain the details of the verification process.'
        'If the information is not available, respond with "Not applicable" or keep null for that field.'
        '''
            "status": "pending" | "completed" | "error", # The status of the verification process
            "verificaion_status": "pending" | "verified" | "not_verified", # The status of the verification process
            "verification_message": "<string>" # A message providing details about the verification process
        }'''
    )
    def __init__(self,tools):
        self.llm = ChatOllama(model="llama3.1:8b",temperature=0.8)
        self.tools = tools
        self.tool_outputs = []

        self.graph = create_react_agent(
            self.llm,
            tools=self.tools,
            checkpointer=memory,
            prompt=self.SYSTEM_INSTRUCTION,
            response_format=VerifiedtResponseFormat,
        )

    async def invoke(self, query, sessionId) -> str:
        config = {'configurable': {'thread_id': sessionId}}
        # Invoke the graph with the user query
        self.graph.invoke({'messages': [('user', query)]}, config)
        return self.get_agent_response(config)

    async def stream(self, query, sessionId) -> AsyncIterable[Dict[str, Any]]:
        inputs = {'messages': [('user', query)]}
        config = {'configurable': {'thread_id': sessionId}}

        for item in self.graph.stream(inputs, config, stream_mode='values'):
            message = item['messages'][-1]
            if (
                isinstance(message, AIMessage)
                and message.tool_calls
                and len(message.tool_calls) > 0
            ):
                yield {
                    'is_task_complete': False,
                    'require_user_input': False,
                    'content': 'Looking up the exchange rates...',
                }
            elif isinstance(message, ToolMessage):
                yield {
                    'is_task_complete': False,
                    'require_user_input': False,
                    'content': 'Processing the exchange rates..',
                }

        yield self.get_agent_response(config)

    def get_agent_response(self, config):
        current_state = self.graph.get_state(config)
        structured_response = current_state.values.get('structured_response')
        if structured_response and isinstance(
            structured_response, VerifiedtResponseFormat
        ):
            if structured_response.status == 'pending':
                return {
                        'is_task_complete': False,
                        'content': structured_response,
                        }
            elif structured_response.status == 'error':
                return {
                        'is_task_complete': False,
                        'content': structured_response,
                        }
            elif structured_response.status == 'completed':
                return {
                        'is_task_complete': True,
                        'content': structured_response,
                        }
        return {
                'is_task_complete': False,
                'content': 'We are unable to process your request at the moment. Please try again.',
                }

    SUPPORTED_CONTENT_TYPES = ['text', 'text/plain']




# Endpoint to serve the RAG Agent Card
@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(RequestVerifyAgent.AGENT_CARD)


async def get_agent_response(task_request,task_id):
    # Extract user's message text from the request
    try:
        instructions = task_request["message"]
        previous_agent_response = task_request.get("request-intake-agent-response", {})
        print(f"Request Intake Agent received task {task_id} with text: '{instructions}' and previous agent response: {previous_agent_response}")
    except (KeyError, IndexError, TypeError) as e:
        print(f"Error extracting user text for task {task_id}: {e}")
        return jsonify({"error": "Bad message format"}), 400
    try:
        print("Connecting to MCP servers...")
        # Initialize the MCP client with the request count MCP server
        client = MultiServerMCPClient(
            {
                "request-count": {
                    "transport": "stdio",
                    "command": "python",
                    "args": ["disaster_agent_system/mcps/request_count.py"]
                }
            }
        )
        # Load tools from the MCP servers
        print("Loading tools from MCP servers...")
        tools = await client.get_tools()
        print(f"Loaded {len(tools)} tools from MCP servers.")
        # Create a ReAct agent
        print("Creating ReAct agent...")
        agent = RequestVerifyAgent(tools)
        # Run a prompt that uses the tools
        print("Sending prompt to agent...")
        instructions = f"instructions: {instructions}" + f" Previous agent response: {previous_agent_response}"
        print(f"Agent instructions: {instructions}")
        response = await agent.invoke(instructions, task_id)
        return response
        
    except Exception as e:
        print(f"Error processing task {task_id}: {e}")
        return jsonify({"error": str(e)}), 500


# Endpoint to handle task 
@app.post("/tasks/send")
def handle_task():
    RESOURCE_TRACKING_AGENT = "http://localhost:5012"
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id", str(uuid.uuid4()))  # Use provided or generate new ID

    try:
        # Run the async agent response using asyncio
        response = asyncio.run(get_agent_response(task_request, task_id))
        print(f"Request Verify Agent response for task {task_id}: {response}")
        response_format = response['content']
        response_format_dict = response_format.model_dump()

        # Formulate A2A response Task
        response_task = {
            "id": task_id,
            "status": "request-verify-agent-completed",
            "initial_request": task_request.get("request-intake-agent-response", {}),
            "next-agent": "task-prioritize-agent",
            "message": "request verify agent has verified the request. now your task is to track the resources and output the available resources list.",
            "request-verify-agent-response": [
                {
                    "role": "request-verify-agent",
                    "response": response_format_dict,
                }
            ]
        }
        print(f"Forwarding task {task_id} response is {response_task}")
        target_agent_url = RESOURCE_TRACKING_AGENT
        target_send_url = f"{target_agent_url}/tasks/send"

        try:
            response = requests.post(target_send_url, json=response_task, timeout=60)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error forwarding task {task_id}: {e}")
            error_response_task = {
                "id": task_id,
                "status": {"state": "failed", "reason": f"Failed to contact downstream agent: {target_agent_url}"},
                "messages": [
                    task_request.get("message", {}),
                    {
                        "role": "request-verify-agent",
                        "parts": [{"text": f"Error contacting target agent at {target_agent_url}. Details: {e}"}]
                    }
                ]
            }
            return jsonify(error_response_task), 502

        return jsonify(response.json())

    except Exception as e:
        print(f"Request Verify Agent error: {e}")
        error_response_task = {
            "id": task_id,
            "status": {"state": "failed", "reason": f"Agent processing failed: {e}"},
            "messages": [
                task_request.get("message", {}),
                {
                    "role": "request-verify-agent",
                    "parts": [{"text": f"RAG agent failed. Details: {e}"}]
                }
            ]
        }
        return jsonify(error_response_task), 500



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5011))
    print(f"Request Verify Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 