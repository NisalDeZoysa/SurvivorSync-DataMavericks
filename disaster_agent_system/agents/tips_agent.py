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
        You are an expert assistant specializing in providing accurate, up-to-date safety tips and preparedness information related to weather, disasters, and health issues.
        Your task is to answer user questions by following these steps:

        Identify the Disaster or Safety Topic:
        Determine whether the user is asking about a specific disaster (e.g., earthquake, flood, wildfire) or general disaster preparedness.

        Reason and Gather Tips:
        If the user asks about a specific disaster, provide detailed, actionable safety and preparedness tips tailored to that disaster.
        If the user asks for general disaster preparedness, provide a concise list of best practices suitable for all hazards.

        Use Tools for Updated Information:
        If the question requires the latest or real-time data, use the brave_mcp_search() tool to find accurate, current information.

        Format the Response:
        Your final output must be a JSON object with the following fields:

        status: Set to "completed" when you have provided the answer, "pending" if more information is needed, or "error" if you cannot answer.

        message: A friendly, informative, and engaging string containing the safety tips or relevant response.

        contact_info: If applicable, include contact information for further assistance (such as emergency hotlines or official resources); otherwise, leave it empty or null.

        Important:

        Only output the final answer as a JSON object in the format below.

        Do not include your reasoning steps, explanations, or any tags—just the JSON object.

        Example output format:

        text
        {
            "status": "completed",
            "message": "Your safety tips or response here.",
            "contact_info": "Contact information here if needed"
        }
        Proceed to answer the user's question according to above instructions.
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
                'is_task_complete': True,
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
# @app.post("/tasks/send")
# def handle_task():
#     task_request = request.get_json()
#     if not task_request:
#         return jsonify({"error": "Invalid request"}), 400

#     task_id = task_request.get("id", str(uuid.uuid4()))  # Use provided or generate new ID
#     try:
#         # Run the async agent response using asyncio
#         response = asyncio.run(get_agent_response(task_request, task_id))
#         agent_response = response['content']
#         # Serialize Pydantic models to dictionaries
#         if isinstance(agent_response, TipsResponseFormat):
#             agent_response = agent_response.model_dump()
#         # Formulate A2A response Task
#         agent_response = {
#             "tips_agent":{
#                 "id": task_id,
#                 "status": "success",
#                 "agent": "tips-agent",
#                 "initial_request": task_request.get("message", {}),
#                 "response": agent_response
#             },
#         }
        
#         print ("\n Respond from Tips Agent: \n", response)

#     except Exception as e:
#         print(f"Agent error: {e}")
#         agent_response ={
#             "tips_agent":  {
#                 "id": task_id,
#                 "status": "error",
#                 "error_message": f"Agent processing failed: {e}",
#                 "agent": "tips-agent",
#             }
#         }
#         print(f"Error processing task {task_id} with agent intake: {e}")
            
#     if not agent_response.get("is_task_complete", False):
#         response = jsonify({
#             "tips-agent": {
#                 "id": task_id,
#                 "status": "error",
#                 "response": agent_response.get("content", {})
#             },
#             "agent_responses": task_request.get("agent_responses", [])
#         })
#         response.status_code = 500
#         return response

#     # Success: return status="success"
#     return jsonify({
#         "tips-agent": {
#             "id": task_id,
#             "status": "success",
#             "response": agent_response.get("content", {})
#         },
#         "agent_responses": task_request.get("agent_responses", [])
#     })
# ... existing imports ...

@app.post("/tasks/send")
def handle_task():
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id", str(uuid.uuid4()))
    agent_responses = task_request.get("agent_responses", [])
    
    try:
        # Run the async agent response
        response = asyncio.run(get_agent_response(task_request, task_id))
        
        # Check if agent returned a valid response
        if response is None:
            raise ValueError("Agent returned no response")
            
        if not response.get("is_task_complete", False):
            raise ValueError("Agent task not completed")
            
        # Extract agent response content
        agent_content = response['content']
        
        # Serialize Pydantic model if needed
        if isinstance(agent_content, TipsResponseFormat):
            agent_content = agent_content.model_dump()
            
        # Formulate successful response
        tips_response = {
            "id": task_id,
            "status": "success",
            "agent": "tips-agent",
            "initial_request": task_request.get("message", ""),
            "response": agent_content
        }
        
        # Add to agent responses
        agent_responses.append({"tips_agent": tips_response})
        
        return jsonify({
            "status": "success",
            "agent_responses": agent_responses
        })
        
    except Exception as e:
        error_msg = f"Agent processing failed: {str(e)}"
        print(f"Error processing task {task_id}: {error_msg}")
        
        # Create error response
        error_response = {
            "tips_agent": {
                "id": task_id,
                "status": "error",
                "error_message": error_msg,
                "agent": "tips-agent",
            }
        }
        
        # Add to agent responses
        agent_responses.append(error_response)
        
        return jsonify({
            "status": "error",
            "agent_responses": agent_responses
        }), 500        
        
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5003))
    print(f"Tips Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 