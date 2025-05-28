import asyncio
from typing import Any, AsyncIterable, Dict, Literal
from flask import Flask, json, request, jsonify
from dotenv import load_dotenv
import os
import uuid
from pydantic import BaseModel
import requests
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langchain.output_parsers import ResponseSchema, StructuredOutputParser
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage, ToolMessage
from disaster_agent_system.models.models import DisasterRequestResponseFormat

load_dotenv()

memory = MemorySaver()

app = Flask(__name__)

class RequestIntakeAgent:

    # RAG Agent Card metadata
    AGENT_CARD = {
        "name": "REQUEST_INTAKE_AGENT",
        "title": "Request Intake Agent",
        "description": "Handle the initial intake of disaster requests and route them to appropriate agents.",
        "url": "http://localhost:5010",  # base URL where this agent is hosted
        "version": "1.0",
        "capabilities": {
            "streaming": False, # Assuming false based on existing server.py
            "pushNotifications": False
        }
    }

    SYSTEM_INSTRUCTION = (
        'You are an intelligent request intake agent.' 
        'Your task is to extract information from the user query into the following JSON format'
        'If the information is not available, respond with "Not applicable" or keep null for that field.'
        'Use tools if needed only'
        '''{
            "status": "pending" # or "completed" or "error" (if encountered an error use "error" status, if completed use "completed" status, if more than 4 fields are not available use "pending" status)
            "request_id": <int>, # Unique request identifier
            "disaster_status": "low" | "medium" | "high" | "critical", # Extract The status of the disaster
            "location": [<latitude>, <longitude>], # Extract Location in latitude and longitude format
            "time": "<ISO 8601 format>", # Extract Time of the event in ISO 8601 format
            "type": "<string>", # Extract Type of request, e.g., "fire", "medical", "flood"
            "affected_count": <int>, # Extract Number of people affected
            "contact_info": "<string>", # Extract Contact information such as phone number or email
            "image_description": "<string>", # Extract Description of any images provided
            "voice_description": "<string>", # Extract Description of any voice messages provided
            "text_description": "<string>" # Extract Description of any text messages provided
            }'''
    )
    def __init__(self,tools):
        self.llm = ChatOllama(model="llama3.1:8b",temperature=0.8)
        self.tools = tools

        self.graph = create_react_agent(
            self.llm,
            tools=self.tools,
            checkpointer=memory,
            prompt=self.SYSTEM_INSTRUCTION,
            response_format=DisasterRequestResponseFormat,
        )

    async def invoke(self, query, sessionId) -> str:
        config = {'configurable': {'thread_id': sessionId}}
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
            structured_response, DisasterRequestResponseFormat
        ):
            if structured_response.status == 'pending':
                return {
                        'is_task_complete': False,
                        'require_user_input': True,
                        'content': structured_response,
                        }
            elif structured_response.status == 'error':
                return {
                        'is_task_complete': False,
                        'require_user_input': True,
                        'content': structured_response,
                        }
            elif structured_response.status == 'completed':
                return {
                        'is_task_complete': True,
                        'require_user_input': False,
                        'content': structured_response,
                        }
        return {
                'is_task_complete': False,
                'require_user_input': True,
                'content': 'We are unable to process your request at the moment. Please try again.',
                }

    SUPPORTED_CONTENT_TYPES = ['text', 'text/plain']

# Endpoint to serve the RAG Agent Card
@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(RequestIntakeAgent.AGENT_CARD)


async def get_agent_response(task_request,task_id):
    # Extract user's message text from the request
    try:
        user_text = task_request["message"]
        print(f"Request Intake Agent received task {task_id} with text: '{user_text}'")
    except (KeyError, IndexError, TypeError) as e:
        print(f"Error extracting user text for task {task_id}: {e}")
        return jsonify({"error": "Bad message format"}), 400
    try:
        # Create a ReAct agent
        print("Creating ReAct agent...")
        tools = []
        agent = RequestIntakeAgent(tools)

        # Run a prompt that uses the tools
        print("Sending prompt to agent...")
        response = await agent.invoke(user_text, task_id)
        return response
        
    except Exception as e:
        print(f"Error processing task {task_id}: {e}")
        return jsonify({"error": str(e)}), 500
    
# Endpoint to handle task 
@app.post("/tasks/send")
def handle_task():
    REQUEST_VERIFY_AGENT = "http://localhost:5011"
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id", str(uuid.uuid4()))  # Use provided or generate new ID

    try:
        # Run the async agent response using asyncio
        response = asyncio.run(get_agent_response(task_request, task_id))
        response_format = response['content']
        response_format_dict = response_format.model_dump()

        # Formulate A2A response Task
        response_task = {
            "id": task_id,
            "status": "request-intake-agent-completed",
            "initial_request": task_request.get("message", {}),
            "next-agent": "request-verify-agent",
            "request-intake-agent-response": [
                {
                    "role": "agent",
                    "response": response_format_dict,
                }
            ]
        }
        print(f"Forwarding task {task_id} response is {response_task}")
        target_agent_url = REQUEST_VERIFY_AGENT
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
                        "role": "agent",
                        "parts": [{"text": f"Error contacting target agent at {target_agent_url}. Details: {e}"}]
                    }
                ]
            }
            return jsonify(error_response_task), 502

        return jsonify(response.json())

    except Exception as e:
        print(f"Agent error: {e}")
        error_response_task = {
            "id": task_id,
            "status": {"state": "failed", "reason": f"Agent processing failed: {e}"},
            "messages": [
                task_request.get("message", {}),
                {
                    "role": "agent",
                    "parts": [{"text": f"RAG agent failed. Details: {e}"}]
                }
            ]
        }
        return jsonify(error_response_task), 500



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5010))
    print(f"Request Intake Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 