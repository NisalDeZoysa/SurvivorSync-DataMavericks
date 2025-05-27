from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import uuid
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langchain.output_parsers import ResponseSchema, StructuredOutputParser

load_dotenv()

app = Flask(__name__)


llm = ChatOllama(
    model="qwen3:4b",  # Adjust model as needed
    temperature=0.8
)

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

# Endpoint to serve the RAG Agent Card
@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(AGENT_CARD)


# Endpoint to handle task requests for the RAG Agent
@app.post("/tasks/send")
async def handle_task():
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id", str(uuid.uuid4())) # Use provided or generate new ID

    # Extract user's message text from the request
    try:
        user_text = task_request["message"]
        print(f"Request Intake Agent received task {task_id} with text: '{user_text}'")
    except (KeyError, IndexError, TypeError) as e:
        print(f"Error extracting user text for task {task_id}: {e}")
        return jsonify({"error": "Bad message format"}), 400
    
#     prompt = f"""
# You are an intelligent request intake agent. You task is to structure the user query in json format below and if not applicable, respond with "Not applicable". Use tools fom the MCP servers if needed.
# You will receive a user query and you need to format it into a structured JSON format that includes the following fields:

# JSON format:
# {
# "request_id": "<request_id>",
#  "location": "<location lat, lon>",
#  "time" : "<time in ISO format>",
#  "type": "<type of request>",
#  "affected_count": "<number of people affected>",
#  "contact_info": "<contact information>",
#  "image_description": "<description of any images provided>",
#  "voice_description": "<description of any voice messages provided>",
#  "text_description": "<description of any text messages provided>",
# }

# User query: "{user_text}"

# Based on the query, only respond with the JSON format if applicable only.
# """

    response_schemas = [
    ResponseSchema(name="request_id", description="Unique request identifier"),
    ResponseSchema(name="location", description="Location in latitude and longitude format, e.g., '12.34, 56.78'"),
    ResponseSchema(name="time", description="Time of the event in ISO 8601 format, e.g., '2025-05-26T10:00:00Z'"),
    ResponseSchema(name="type", description="Type of request, e.g., 'fire', 'medical', 'flood'"),
    ResponseSchema(name="affected_count", description="Number of people affected"),
    ResponseSchema(name="contact_info", description="Contact information such as phone number or email"),
    ResponseSchema(name="image_description", description="Description of any images provided"),
    ResponseSchema(name="voice_description", description="Description of any voice messages provided"),
    ResponseSchema(name="text_description", description="Description of any text messages provided"),
]

    output_parser = StructuredOutputParser.from_response_schemas(response_schemas)
    format_instructions = output_parser.get_format_instructions()

    prompt = f"""
You are an intelligent request intake agent. Your task is to extract information from the user query into the following JSON format Use tools if needed only.

{format_instructions}

User query: "{user_text}"

If the information is not available, respond with "Not applicable" for that field.
"""
    try:
        print("Connecting to MCP servers...")
        client = MultiServerMCPClient(
            {
                # add image and voice processing MCP servers here if needed
                "math": {
                    "transport": "stdio",
                    "command": "python",
                    "args": ["../mcps/math.py"]
                },
                "web-search": {
                    "transport": "stdio",
                    "command": "python",
                    "args": ["../mcps/brave_search_mcp_server.py"]
                },
            }
        )

        # Load tools from the MCP servers
        print("Loading tools...")
        tools = await client.get_tools()
        print(f"Tools loaded: {[tool.name for tool in tools]}")

        # Create a ReAct agent
        print("Creating ReAct agent...")
        agent = create_react_agent(llm, tools)

        # Run a prompt that uses the tools
        print("Sending prompt to agent...")
        response = await agent.ainvoke(
            {"messages": [{"role": "user", "content": prompt}]},
        )
        print("Agent response ",response)
        
        # print(f"Agent for task {task_id} completed. Response: '{response[:100]}...'" ) # Log snippet

        # Formulate A2A response Task
        response_task = {
            "id": task_id,
            "status": {"state": "completed"},
            "messages": [
                task_request.get("message", {}),  # include original user message
                {
                    "role": "agent",
                    "parts": [{"text": response}]
                }
            ]
        }
        return jsonify(response_task)

    except Exception as e:
        print(f"Error processing task {task_id} with agent: {e}") # Log agent error
        # Return an error task response
        error_response_task = {
            "id": task_id,
            "status": {"state": "failed", "reason": f"Agent processing failed: {e}"},
            "messages": [
                task_request.get("message", {}), # include original user message
                 {
                    "role": "agent",
                    "parts": [{"text": f"Error: The RAG agent failed to process the request. Details: {e}"}]
                }
            ]
        }
        return jsonify(error_response_task), 500 # Internal Server Error

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5010))
    print(f"Request Intake Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 