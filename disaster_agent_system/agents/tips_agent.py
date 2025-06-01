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
from disaster_agent_system.models.models import TipsResponseFormat

load_dotenv()

memory = MemorySaver()

app = Flask(__name__)

class TipsAgent:

    # RAG Agent Card metadata
    AGENT_CARD = {
        "name": "TIPS_AGENT",
        "title": "Tips and General Question Answering Person",
        "description": "This agent provides safety tips and advice for disaster preparedness.",
        "url": "http://localhost:5003",  # base URL where this agent is hosted
        "version": "1.0",
        "capabilities": {
            "streaming": False, # Assuming false based on existing server.py
            "pushNotifications": False
        }
    }

    SYSTEM_INSTRUCTION = (
    '''
    You are a helpful person that answers users questions related to weather, disasters or safety or health related issues using given tools.
    When a user asks for disaster safety tips, you will provide relevant information based on the type of disaster they mention.
    If the user asks for tips related to a specific disaster, you will provide detailed safety measures and preparedness tips.
    If the user asks for general disaster preparedness tips, you will provide a list of best practices.
    If you need updated or real-time data, use the brave mcp search tool to find accurate and current information.
    Always respond in a friendly, informative, and engaging manner.
    Your final output must be a TipsResponseFormat object with the following fields:
    - status: 'pending', 'completed', or 'error'
    - message: A string containing the safety tips or relevant chat response
    - contact_info: A string containing contact information for further assistance, if applicable; otherwise, leave empty or null
    Use the following JSON format for your response:
    ```
    {
        "status": "completed",
        "message": "Safety Tips or related chat response here",
        "contact_info": "Contact information here if needed"
    }
    ```
    '''
    )

    def __init__(self,tools):
        self.llm = ChatOllama(
        model="qwen3:4b",temperature=0.8)
        self.tools = tools

        self.graph = create_react_agent(
            self.llm,
            tools=self.tools,
            checkpointer=memory,
            prompt=self.SYSTEM_INSTRUCTION,
            response_format=TipsResponseFormat,
        )

    async def invoke(self, query, sessionId) -> str:
        config = {'configurable': {'thread_id': sessionId}}
        
        # Properly invoke the agent and get the final state
        final_state = await self.graph.ainvoke(
            {"messages": [("user", query)]},
            config=config
        )
        # Process the final state
        return self.get_agent_response(final_state, config)

    def get_agent_response(self, state, config):
        # Extract the structured response from the final state
        structured_response = state.get("structured_response")
        
        if structured_response and isinstance(structured_response, TipsResponseFormat):
            return {
                'is_task_complete': structured_response.status == 'completed',
                'content': structured_response,
            }
        
        # Handle cases where no proper response was generated
        return {
            'is_task_complete': False,
            'content': TipsResponseFormat(
                status="error",
                message="Failed to generate proper response",
                contact_info=""
            )
        }

# Endpoint to serve the RAG Agent Card
@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(TipsAgent.AGENT_CARD)


async def get_agent_response(task_request,task_id):
    # Extract user's message text from the request
    try:
        user_text = task_request["message"]
        print(f"Tips received task {task_id} with text: '{user_text}'")
    except (KeyError, IndexError, TypeError) as e:
        print(f"Error extracting user text for task {task_id}: {e}")
        return jsonify({"error": "Bad message format"}), 400
    try:
        # Create a ReAct agent
        client = MultiServerMCPClient(
            {
                "web-search": {
                    "transport": "stdio",
                    "command": "python",
                    "args": ["disaster_agent_system/mcps/brave_search_mcp_server.py"]
                }
            }
        )
        print("Creating ReAct agent...")
        tools = await client.get_tools()
        print("Tools loaded successfully, initializing RequestIntakeAgent...")
        agent = TipsAgent(tools=tools)

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
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id", str(uuid.uuid4()))  # Use provided or generate new ID
    try:
        # Run the async agent response using asyncio
        response = asyncio.run(get_agent_response(task_request, task_id))
        response_format = response['content']
        # Serialize Pydantic models to dictionaries
        if isinstance(response_format, TipsResponseFormat):
            response_format = response_format.model_dump()
        # Formulate A2A response Task
        response_task = {
            "tips_agent":{
                "id": task_id,
                "status": "success",
                "agent": "tips-agent",
                "initial_request": task_request.get("message", {}),
                "response": response_format
            },
        }
        
        print ("\n Respond from Tips Agent: \n", response)

    except Exception as e:
        print(f"Agent error: {e}")
        response_task ={
            "tips_agent":  {
                "id": task_id,
                "status": "error",
                "error_message": f"Agent processing failed: {e}",
                "agent": "tips-agent",
            }
        }
        print(f"Error processing task {task_id} with agent intake: {e}")
            
    return jsonify(response_task)
        
        
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    print(f"Tips Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 