# import asyncio
# from typing import Any, AsyncIterable, Dict, Literal
# from flask import Flask, json, request, jsonify
# from dotenv import load_dotenv
# import os
# import uuid
# from pydantic import BaseModel
# from langchain_mcp_adapters.client import MultiServerMCPClient
# from langchain_ollama import ChatOllama
# from langgraph.prebuilt import create_react_agent
# from langchain.output_parsers import ResponseSchema, StructuredOutputParser
# from langgraph.checkpoint.memory import MemorySaver
# from langchain_core.messages import AIMessage, ToolMessage
# import requests
# from disaster_agent_system.models.models import DisasterRequestResponseFormat

# load_dotenv()


# memory = MemorySaver()

# app = Flask(__name__)

# class VerifiedtResponseFormat(BaseModel):
#     """Respond to the user in this format."""
#     help_needed_requests: list[int] = []
#     status : Literal['pending', 'completed','error'] = 'pending'
#     verificaion_status: Literal['pending', 'verified', 'not_verified'] = 'pending'
#     verification_message: str
    
# class RequestVerifyAgent:

#     # RAG Agent Card metadata
#     AGENT_CARD = {
#         "name": "REQUEST_VERIFY_AGENT",
#         "title": "Request Verify Agent",
#         "description": "Verify the disaster request information provided by the user.",
#         "url": "http://localhost:5011",  # base URL where this agent is hosted
#         "version": "1.0",
#         "capabilities": {
#             "streaming": False, # Assuming false based on existing server.py
#             "pushNotifications": False
#         }
#     }

#     SYSTEM_INSTRUCTION = (
#         'You are an intelligent request verify agent.' 
#         'Your task is to verify the disaster request information provided by the user and respond in the following JSON format.'
#         'Use the available tools to verify the information.'
#         'Get all the disasterIds from the data rows return from the request_count tool. and add them to the help_needed_requests list as comma seperated integers.'
#         'If the tool calling gives sql query data rows, set the status to "completed"'
#         'If the return query count from request_count tool is greater than 2, set the verification_status to "verified".'
#         'If the return query count from request_count tool is greater than 5, set the verification_status to "already_verified".' 
#         'If the return query count from request_count tool is less than 2, set the verification_status to "not_verified".'
#         'verification_message should contain the details of the verification process.'
#         'If the information is not available, respond with "Not applicable" or keep null for that field.'
#         '''
#             "help_needed_requests": [<list of int>], # List of request IDs that need assistance
#             "status": "pending" | "completed" | "error", # The status of the verification process
#             "verificaion_status": "pending" | "verified" | "already_verified" | "not_verified", # The status of the verification process
#             "verification_message": "<string>" # A message providing details about the verification process
#         }'''
#     )
#     def __init__(self,tools):
#         self.llm = ChatOllama(model="qwen3:4b",temperature=0.8)
#         self.tools = tools
#         self.tool_outputs = []

#         self.graph = create_react_agent(
#             self.llm,
#             tools=self.tools,
#             checkpointer=memory,
#             prompt=self.SYSTEM_INSTRUCTION,
#             response_format=VerifiedtResponseFormat,
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
        
#         if structured_response and isinstance(structured_response, VerifiedtResponseFormat):
#             return {
#                 'is_task_complete': structured_response.status == 'completed',
#                 'content': structured_response,
#             }
        
#         # Handle cases where no proper response was generated
#         return {
#             'is_task_complete': False,
#             'content': VerifiedtResponseFormat(
#                 help_needed_requests=[],
#                 status="error",
#                 verificaion_status="not_verified",
#                 verification_message="Failed to generate proper response"
#             )
#         }



# # Endpoint to serve the RAG Agent Card
# @app.get("/.well-known/agent.json")
# def get_agent_card():
#     return jsonify(RequestVerifyAgent.AGENT_CARD)


# async def get_agent_response(task_request,task_id):
#     # Extract user's message text from the request
#     try:
#         intake_data = task_request["request_intake_agent"]
#         instructions = intake_data["message"]
        
#         # Access hyphenated key using dictionary syntax
#         previous_agent_response = intake_data["request-intake-agent-response"]
        
#         print(f"Request Verify Agent received task {task_id} with text: '{instructions}' and previous agent response: {previous_agent_response}")
#     except (KeyError, IndexError, TypeError) as e:
#         print(f"Error extracting user text for task {task_id}: {e}")
#         return jsonify({"error": "Bad message format"}), 400
#     try:
#         print("Connecting to MCP servers...")
#         # Initialize the MCP client with the request count MCP server
#         client = MultiServerMCPClient(
#             {
#                 "request-count": {
#                     "transport": "stdio",
#                     "command": "python",
#                     "args": ["disaster_agent_system/mcps/request_count.py"]
#                 }
#             }
#         )
#         # Load tools from the MCP servers
#         print("Loading tools from MCP servers...")
#         tools = await client.get_tools()
#         print(f"Loaded {len(tools)} tools from MCP servers.")
#         # Create a ReAct agent
#         print("Creating ReAct agent...")
#         agent = RequestVerifyAgent(tools)
#         # Run a prompt that uses the tools
#         print("Sending prompt to agent...")
        
#         full_instructions = f"{instructions}\n\n Previous agent response: {json.dumps(previous_agent_response)}"
#         print(f"Verify Agent instructions: {full_instructions}")
        
#         response = await agent.invoke(full_instructions, task_id)
#         response_format_dict = response['content'].model_dump()
#         print(f"Request Verify Agent response for task {task_id}: {response_format_dict}")
#         return response_format_dict
        
#     except Exception as e:
#         print(f"Error processing task {task_id}: {e}")
#         return jsonify({"error": str(e)}), 500


# # Endpoint to handle task 
# @app.post("/tasks/send")
# def handle_task():
#     RESOURCE_TRACKING_AGENT = "http://localhost:5012"
#     task_request = request.get_json()
    
#     if not task_request:
#         return jsonify({"error": "Invalid request"}), 400
#     intake_data = task_request["request-intake-agent"]
#     task_id = intake_data.get("id", str(uuid.uuid4()))
#     response = {}
#     try:
#         agent_response = asyncio.run(get_agent_response(task_request, task_id))
        
#         print(f"Request Verify Agent response for task {task_id}: {agent_response}")
        
#         response_content = agent_response['content']
#         response_format_dict = response_content.model_dump()
#         # Formulate A2A response Task
#         response_task = {
#             "request-verify-agent": {
#                 "id": task_id,
#                 "status": "success",
#                 "agent" : "request-verify-agent",
#                 "previous_request": task_request["request-intake-agent"]["request-intake-agent-response"].get("response", {}),
#                 "next-agent": "resource-tracking-agent",
#                 "message": "request verify agent has verified the request. now your task is to track the resources and output the available resources list.",
#                 "request-verify-agent-response": [
#                     {
#                         "role": "request-verify-agent",
#                         "response": response_format_dict,
#                     }
#                 ]
#             }
#         }
#         print(f"Forwarding task {task_id} response is {response_task}")
#         target_agent_url = RESOURCE_TRACKING_AGENT
#         target_send_url = f"{target_agent_url}/tasks/send"

#         try:
#             if response_task.get("request_verify_agent", {}).get("next-agent") == "resource-tracking-agent":
#                response = requests.post(target_send_url, json=response_task, timeout=300)        
#             else:
#                 print(f"Skipping forwarding to {target_agent_url} as next-agent is not resource-tracking-agent")
            
#         except requests.exceptions.RequestException as e:
#             print(f"Error forwarding task {task_id}: {e}")
#             response = {
#                 "resource-tracking-agent": {
#                     "id": task_id,
#                     "status": "error",
#                     "error_message": f"Failed to contact target agent at {target_agent_url}. Details: {e}",
#                     "agent" : "resource-tracking-agent",
#                     "resource-tracking-agent-response":
#                         {
#                             "role": "resource-tracking-agent",
#                             "response": [{"text": f"Error contacting target agent at {target_agent_url}. Details: {e}"}]
#                         }
                    
#                     }
#             }
#         print ("\n Respond from Request verify Agent: \n", response)

#     except Exception as e:
#         print(f"Request Verify Agent error: {e}")
#         print(f"Agent error: {e}")
#         response_task ={
#             "request-verify-agent":  {
#                 "id": task_id,
#                 "status": "error",
#                 "error_message": f" Request Verify Agent processing failed: {e}",
#                 "agent": "request-verify-agent",
#                 "request-verify-agent-response": 
#                     {
#                         "role": "request-verify-agent",
#                         "response": [{"text": f"Request Verify agent failed. Details: {e}"}]
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
#     port = int(os.environ.get("PORT", 5011))
#     print(f"Request Verify Agent server starting on port {port}")
#     app.run(host="0.0.0.0", port=port) 


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

class VerifiedResponseFormat(BaseModel):
    request_details : DisasterRequestResponseFormat 
    status: str
    verification_status: Literal['PENDING', 'VERIFIED', 'NOT_VERIFIED'] = 'VERIFIED'
    verification_message: str

class RequestVerifyAgent:
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
    # 'You are an intelligent request verification agent. and your task is to update the verification_status of the disaster request.'
    # 'Your task is to verify the disaster request information provided by the user and respond in the following JSON format. '
    # 'If image or voice input is provided, prioritize those for verification using available tools. '
    # 'If no image or voice is provided, use contextual and logical reasoning to assess the likelihood that the request is legitimate. '
    # 'Use tool - get_disaster_requests_from_lat_long(latitude, longitude, disasterId) to fetch all the disasters near the area from the data rows.'
    # 'If the tool call returns SQL query of data rows, set the status to "COMPLETED". '
    # 'If the return query count from request_count is greater than 2, set the verification_status to "VERIFIED".'
    # 'If the return query count is less than 2, set the verification_status to "NOT_VERIFIED". '
    # 'The verification_message should clearly describe the process and basis of verification—whether it used image, voice, or inferred intelligence. '
    # 'If the information is not available or cannot be confirmed, respond with "Not applicable" or use null for that field.'
    # '''
    # {
    #     "request_details": <DisasterRequestResponseFormat>,  # The details of the disaster request
    #     "status": "pending" | "completed" | "error" (# This status indicates whether the verification process was successful or not),
    #     "verification_status": "PENDING" | "VERIFIED" | "NOT_VERIFIED",  (# This status is very important and indicates whether the request was verified or not. So analyze the above data rows and set the status accordingly in block letters),
    #     "verification_message": "<string>"  # Explanation of how the request was verified
    # }
    # Finally, call the verify_disaster_request(requestId, verrification_status) tool to update the status of the request in the database.
    # '''
                '''
            You are an intelligent request verification agent.

            Your task is to:
            1. Verify the disaster request information using real data via tools.
            2. Update the disaster request's verification status in the database.

            ---

            ### Input:
            Each request includes the following:
            - `latitude`
            - `longitude`
            - `disasterId`
            - `request_id`
            - (Optional) image or voice data

            ---

            ### Step-by-step Instructions:

            1. **If image or voice input is provided**, prioritize using it for verification.
                - Otherwise, proceed to step 2 using contextual data (lat, long, disasterId).

            2. **Call Tool to Fetch Nearby Requests:**

            Use the tool:
            ```python
            get_disaster_requests_from_lat_long(latitude, longitude, disasterId)
            
            After calling this tool, you will receive a list of disaster requests near the specified location.
            ```

            3. **Determine Verification Status:**
            - If the tool returns data rows: 
                - Set `status` to "COMPLETED".
                - If the return query count from request_count is greater than 2, set `verification_status` to "VERIFIED".
                - If the return query count is less than 2, set `verification_status` to "NOT_VERIFIED".
                - The `verification_message` should clearly describe the process and basis of verification—whether it used image, voice, or inferred intelligence.
            - If the tool returns no data rows:
                - Set `status` to "ERROR".
                - Set `verification_status` to "NOT_VERIFIED".
                - Provide a clear `verification_message` explaining the lack of data.
            
            4. **Update the Request Status:**
            - Call the tool:
            ```python
            verify_disaster_request(request_id, verification_status)
            ```     
            '''

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
                "request_details": DisasterRequestResponseFormat(
                    status = 'error',
                    request_id = 0,
                    disaster = 'unknown',
                    disasterId = 0,
                    disaster_status = 'medium',
                    location = [0.0, 0.0],
                    time = '2023-11-15T10:00:00Z',
                    affected_count = 0,
                    contact_info = 'Not applicable',
                    image_description = 'Not applicable',
                    voice_description = 'Not applicable',
                    text_description = 'Not applicable'   
                ),
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
        # Initialize tools and agent
        client = MultiServerMCPClient(
        {
            "mcp-server": 
            {
            "transport": "stdio", 
            "command": "python",
            "args": ["disaster_agent_system/mcps/mcp_server.py"]
            }
        })
        tools = await client.get_tools()
        print(f"Loaded {len(tools)} tools from MCP servers.")
        print("Creating Request Verify Agent...")
        agent = RequestVerifyAgent(tools)
        # Pass the intake response as instruction text
        return await agent.invoke(str(task_request), task_id)
    except Exception as e:
        # Return error content on exception
        return {
            "error": str(e), 
            "content": {
            "request_details": DisasterRequestResponseFormat(
                    status = 'error',
                    request_id = 0,
                    disaster_status = 'medium',
                    disaster = 'unknown',
                    disasterId=0,
                    location = [0.0, 0.0],
                    time = '2023-11-15T10:00:00Z',
                    affected_count = 0,
                    contact_info = 'Not applicable',
                    image_description = 'Not applicable',
                    voice_description = 'Not applicable',
                    text_description = 'Not applicable'
            ),
            "status": "error",
            "verification_status": "not_verified",
            "verification_message": f"Error: {str(e)}"
        }}

@app.post("/tasks/send")
def handle_verify_task():
    task_request = request.get_json()
    print("Task request received for Request Verify Agent:", task_request)
    agent_responses = task_request.get("agent_responses", [])
    # Extract the response dict for "request-intake-agent" to another variable
    request_intake_agent = next(
        (agent_resp.get("response") for agent_resp in agent_responses if agent_resp.get("agent") == "request-intake-agent"),
        None
    )
    task_id = request_intake_agent.get("id", "") if request_intake_agent is not None else ""
    try:
        agent_response = asyncio.run(get_verify_agent_response(request_intake_agent, task_id))
        print(f"Request Verify Agent response for task {task_id}: {agent_response}")
    except Exception as e:
        agent_response = {
            "error": str(e), 
            "content": {
            "request_details": DisasterRequestResponseFormat(
                    status = 'error',
                    request_id = 0,
                    disaster_status = 'medium',
                    disaster = 'unknown',
                    disasterId=0,
                    location = [0.0, 0.0],
                    time = '2023-11-15T10:00:00Z',
                    affected_count = 0,
                    contact_info = 'Not applicable',
                    image_description = 'Not applicable',
                    voice_description = 'Not applicable',
                    text_description = 'Not applicable'
            ),
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
    port = int(os.environ.get("PORT", 5011))
    print(f"Request Intake Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 
