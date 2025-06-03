# import asyncio
# import datetime
# import re
# from typing import Any, AsyncIterable, Dict, Literal
# from flask import Flask, json, request, jsonify
# from dotenv import load_dotenv
# import os
# import uuid
# from pydantic import BaseModel
# import requests
# from langchain_mcp_adapters.client import MultiServerMCPClient
# from langchain_ollama import ChatOllama
# from langgraph.prebuilt import create_react_agent
# from langchain.output_parsers import ResponseSchema, StructuredOutputParser
# from langgraph.checkpoint.memory import MemorySaver
# from langchain_core.messages import AIMessage, ToolMessage
# from disaster_agent_system.models.models import DisasterRequestResponseFormat

# load_dotenv()

# memory = MemorySaver()

# app = Flask(__name__)

# class RequestIntakeAgent:

#     # RAG Agent Card metadata
#     AGENT_CARD = {
#         "name": "REQUEST_INTAKE_AGENT",
#         "title": "Request Intake Agent",
#         "description": "Handle the initial intake of disaster requests and route them to appropriate agents.",
#         "url": "http://localhost:5010",  # base URL where this agent is hosted
#         "version": "1.0",
#         "capabilities": {
#             "streaming": False, # Assuming false based on existing server.py
#             "pushNotifications": False
#         }
#     }

#     SYSTEM_INSTRUCTION = (
#         'You are an intelligent request intake agent.' 
#         'Your task is to extract information from the user query into the following JSON format'
#         'If the information is not available, respond with "Not applicable" or keep null for that field.'
#         'Use tools if needed only'
#         '''{
#             "status": "pending" # or "completed" or "error" (if encountered an error use "error" status, if completed use "completed" status, if more than 4 fields are not available use "pending" status)
#             "request_id": <int>, # Unique request identifier
#             "disaster_status": "low" | "medium" | "high" | "critical", # Extract The status of the disaster
#             "location": [<latitude>, <longitude>], # Extract Location in latitude and longitude format
#             "time": "<ISO 8601 format>", # Extract Time of the event in ISO 8601 format
#             "type": "<string>", # Extract Type of request, e.g., "fire", "medical", "flood"
#             "affected_count": <int>, # Extract Number of people affected
#             "contact_info": "<string>", # Extract Contact information such as phone number or email
#             "image_description": "<string>", # Get image_caption using tools"
#             "voice_description": "<string>", # Get voice_transcript using tools"
#             "text_description": "<string>" # Extract Description of if text messages provided else "Not applicable"
#             }'''
#     )
#     def __init__(self,tools):
#         self.llm = ChatOllama(
#             model="qwen3:4b"
#             ,temperature=0.8)
#         self.tools = tools

#         self.graph = create_react_agent(
#             self.llm,
#             tools=self.tools,
#             checkpointer=memory,
#             prompt=self.SYSTEM_INSTRUCTION,
#             response_format=DisasterRequestResponseFormat,
#         )

#     async def invoke(self, query, sessionId) -> str:
#         config = {'configurable': {'thread_id': sessionId}}
        
#         # Properly invoke the agent and get the final state
#         final_state = await self.graph.ainvoke(
#             {"messages": [("user", query)]},
#             config=config
#         )
#         # Process the final state
#         return self.get_agent_response(final_state, config)

#     def get_agent_response(self, state, config):
#         # Extract the structured response from the final state
#         structured_response = state.get("structured_response")
        
#         if structured_response and isinstance(structured_response, DisasterRequestResponseFormat):
#             return {
#                 'is_task_complete': structured_response.status == 'completed',
#                 'content': structured_response,
#             }
            
            
        
#         # Handle cases where no proper response was generated
#         return {
#             'is_task_complete': False,
#             'content': DisasterRequestResponseFormat(
#                 status="error",
#                 request_id=0,
#                 disaster_status="medium",
#                 location=[0.0, 0.0],  # Default to zero coordinates
#                 time=datetime.datetime.now().isoformat(),  # Current time in ISO format
#                 type="unknown",  # Default type
#                 affected_count=0,  # Default affected count
#                 contact_info="Not applicable",  # Default contact info
#                 image_description="Not applicable",  # Default image description
#                 voice_description="Not applicable",
#                 text_description="Not applicable"
#             )
#         }

# # Endpoint to serve the RAG Agent Card
# @app.get("/.well-known/agent.json")
# def get_agent_card():
#     return jsonify(RequestIntakeAgent.AGENT_CARD)


# async def get_agent_response(task_request,task_id):
#     # Extract user's message text from the request
#     try:
#         user_text = task_request["message"]
#         print(f"Request Intake Agent received task {task_id} with text: '{user_text}'")
#     except (KeyError, IndexError, TypeError) as e:
#         print(f"Error extracting user text for task {task_id}: {e}")
#         return jsonify({"error": "Bad message format"}), 400
#     try:
#         # Create a ReAct agent
#         client = MultiServerMCPClient(
#             {
#                 "image_voice_caption": {
#                     "transport": "stdio",
#                     "command": "python",
#                     "args": ["disaster_agent_system/mcps/image_voice_caption.py"]
#                 }
#             }
#         )
#         print("Creating ReAct agent...")
#         tools = await client.get_tools()
#         print("Tools loaded successfully, initializing RequestIntakeAgent...")
#         agent = RequestIntakeAgent(tools)

#         # Run a prompt that uses the tools
#         print("Sending prompt to agent...")
#         response = await agent.invoke(user_text, task_id)
#         print(f"Request Intake Agent response for task {task_id}: {response}")
#         # response_format = response['content']
#         # response_format_dict = response_format.model_dump()
#         return response
        
#     except Exception as e:
#         print(f"Error processing task {task_id}: {e}")
#         return jsonify({"error": str(e)}), 500
    
# # Endpoint to handle task 
# @app.post("/tasks/send")
# def handle_task():
#     REQUEST_VERIFY_AGENT = "http://localhost:5011"
#     task_request = request.get_json()
#     if not task_request:
#         return jsonify({"error": "Invalid request"}), 400

#     task_id = task_request.get("id", str(uuid.uuid4()))  # Use provided or generate new ID

#     try:
#         # Run the async agent response using asyncio
#         response = asyncio.run(get_agent_response(task_request, task_id))
        

#         # Formulate A2A response Task
#         response_task = {
#             "request-intake-agent":{
#                 "id": task_id,
#                 "status": "success",
#                 "agent": "request-intake-agent",
#                 "previous_request": task_request.get("message", {}),
#                 "next-agent": "request-verify-agent",
#                 "message": "Please analyze the request details and verify the request using the tools.",
#                 "response": [
#                 {
#                     "role": "request-intake-agent",
#                     "response": response.content
#                 }
#             ]
#             }
#         }
#         print(f"Forwarding task {task_id} response is {response_task}")
#         target_agent_url = REQUEST_VERIFY_AGENT
#         target_send_url = f"{target_agent_url}/tasks/send"

#         try:
#             if response_task.get("request_intake_agent", {}).get("next-agent") == "request-verify-agent":
#                response = requests.post(target_send_url, json=response_task, timeout=60)
#                response.raise_for_status()
#             else:
#                 print(f"Next agent is not request-verify-agent, skipping forwarding to {target_agent_url}")
#                 return jsonify(response_task), 200 
            
#         except requests.exceptions.RequestException as e:
#             print(f"Error forwarding task {task_id}: {e}")
#             response = {
#                 "request-verify-agent": {
#                     "id": task_id,
#                     "status": "error",
#                     "error_message": f"Failed to contact target agent at {target_agent_url}. Details: {e}",
#                     "agent" : "request-verify-agent",
#                     "request-verify-agent-response": 
#                         {
#                             "role": "request-verify-agent",
#                             "response": [{"text": f"Error contacting target agent at {target_agent_url}. Details: {e}"}]
#                         }
#                     }
#             }
#         print ("\n Respond from Request verify Agent: \n", response)

#     except Exception as e:
#         print(f"Agent error: {e}")
#         response_task ={
#             "request-intake-agent":  {
#                 "id": task_id,
#                 "status": "error",
#                 "error_message": f"Request Intake Agent processing failed: {e}",
#                 "agent": "request-intake-agent",
#                 "request-intake-agent-response":
#                     {
#                         "role": "request-intake-agent",
#                         "response": [{"text": f"Request Intake Agent processing failed. Details: {e}"}]
#                     }
#             }
#         }
#         print(f"Error processing task {task_id} with agent intake: {e}")
#         response = {}    
#     # Ensure response is a dict before unpacking
#     if not isinstance(response, dict):
#         try:
#             response = response.json()
#         except Exception:
#             response = {}
#     response_task = {**response_task, **response}
#     return jsonify(response_task)




# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5010))
#     print(f"Request Intake Agent server starting on port {port}")
#     app.run(host="0.0.0.0", port=port) 



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

class RequestIntakeAgent:
    AGENT_CARD = {
        "name": "REQUEST_INTAKE_AGENT",
        "title": "Request Intake Agent",
        "description": "Handle the initial intake of disaster requests and route them to appropriate agents.",
        "url": "http://localhost:5010",
        "version": "1.0",
        "capabilities": {
            "streaming": False,
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
            "image_description": "<string>", # Get image_caption using tools"
            "voice_description": "<string>", # Get voice_transcript using tools"
            "text_description": "<string>" # Extract Description of if text messages provided else "Not applicable"
            }'''
        )
    def __init__(self, tools):
        self.llm = ChatOllama(model="qwen3:4b", temperature=0.8)
        self.graph = create_react_agent(self.llm, tools=tools, checkpointer=memory,
                                        prompt=self.SYSTEM_INSTRUCTION,
                                        response_format=DisasterRequestResponseFormat)

    async def invoke(self, query, sessionId):
        config = {'configurable': {'thread_id': sessionId}}
        final_state = await self.graph.ainvoke({"messages": [("user", query)]}, config=config)
        return self.get_agent_response(final_state)

    def get_agent_response(self, state):
        structured_response = state.get("structured_response")
        print(f"Structured response from request intake agent: {structured_response}")
        if structured_response and isinstance(structured_response, DisasterRequestResponseFormat):
            return {
                'is_task_complete': True,
                'content': structured_response.model_dump(),
            }
        # Return error format if structured response is missing or wrong
        return {
            'is_task_complete': False,
            'content': {
                "status": "error", 
                "request_id": 0,
                "disaster_status": "medium", 
                "location": [0.0, 0.0],
                "time": datetime.datetime.now().isoformat(),
                "type": "unknown", 
                "affected_count": 0,
                "contact_info": "Not applicable", 
                "image_description": "Not applicable",
                "voice_description": "Not applicable", 
                "text_description": "Not applicable"
            }
        }

@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(RequestIntakeAgent.AGENT_CARD)

async def get_agent_response(task_request, task_id):
    try:
        user_text = task_request["message"]
        print(f"User sent message: '{user_text}'")
    except (KeyError, TypeError) as e:
        # Respond with immediate error content if message is missing
        return {
            "error": "Bad message format", 
            "content": {
            "status": "error", "request_id": 0,
            "disaster_status": "medium", 
            "location": [0.0, 0.0],
            "time": datetime.datetime.now().isoformat(),
            "type": "unknown", "affected_count": 0,
            "contact_info": "Not applicable", "image_description": "Not applicable",
            "voice_description": "Not applicable", "text_description": "Not applicable"
        }}
    try:
        print(f"Request Intake Agent received task {task_id} with text: '{user_text}'")
        # Initialize tools and agent
        client = MultiServerMCPClient(
        { 
            "image_voice_caption": 
            {
            "transport": "stdio", 
            "command": "python",
            "args": ["disaster_agent_system/mcps/image_voice_caption.py"]
        }})
        
        tools = await client.get_tools()
        print("Tools loaded successfully, initializing RequestIntakeAgent...")
        # Create the agent
        agent = RequestIntakeAgent(tools)
        return await agent.invoke(user_text, task_id)
    except Exception as e:
        # Return error content on exception
        return {"error": str(e), "content": {
            "status": "error", 
            "request_id": 0,
            "disaster_status": "medium", 
            "location": [0.0, 0.0],
            "time": datetime.datetime.now().isoformat(),
            "type": "unknown", 
            "affected_count": 0,
            "contact_info": "Not applicable", 
            "image_description": "Not applicable",
            "voice_description": "Not applicable", 
            "text_description": "Not applicable"
        }}

@app.post("/tasks/send")
def handle_task():
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    print(f"Received task request: {task_request}")
    # Extract task ID or generate a new one
    task_id = task_request.get("id", "")
    try:
        agent_response = asyncio.run(get_agent_response(task_request, task_id))
        print(f"Request Intake Agent response for task {task_id}: {agent_response}")
    except Exception as e:
        # Catch any unexpected exceptions during processing
        agent_response = {
            "error": str(e), 
            "content": {
            "status": "error", 
            "request_id": 0,
            "disaster_status": "medium", 
            "location": [0.0, 0.0],
            "time": datetime.datetime.now().isoformat(),
            "type": "unknown", 
            "affected_count": 0,
            "contact_info": "Not applicable", 
            "image_description": "Not applicable",
            "voice_description": "Not applicable", 
            "text_description": "Not applicable"
            }
        }

    # If the agent did not complete successfully, return HTTP 500 with status="error"
    if not agent_response.get("is_task_complete", False):
        response = jsonify({
            "request-intake-agent": {
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
        "request-intake-agent": {
            "id": task_id,
            "status": "success",
            "response": agent_response.get("content", {})
        },
        "agent_responses": task_request.get("agent_responses", [])
    })
    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5010))
    print(f"Request Intake Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 
