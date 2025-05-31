from flask import Flask, request, jsonify
import requests
import uuid
import os
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from dotenv import load_dotenv

load_dotenv()

# Setup the Ollama Qwen3:4b model
llm = ChatOllama(
    model="llama3.1:8b",
    temperature = 0.2,
    num_predict = 256,
    # You can add more params here if needed
)

app = Flask(__name__)

REQUEST_INTAKE_AGENT = "http://localhost:5010"
CHAT_BOT_AGENT = "http://localhost:5002"  # URL for the Chat Bot Agent
TIPS_AGENT = "http://localhost:5003"  # URL for the Tips Agent
SEARCH_AGENT = "http://localhost:5001"  # URL for the Search Agent

# Agent Card metadata for the Gateway Agent
AGENT_CARD = {
    "name": "GatewayAgent",
    "description": "Routes requests to either a REQUEST_INTAKE_AGENT, CHAT_BOT_AGENT, TIPS_AGENT, or SEARCH_AGENT using AI.",
    "url": "http://localhost:5005",  # base URL where this gateway is hosted
    "version": "1.1",
    "capabilities": {
        "streaming": False,
        "pushNotifications": False
    }
}

# --- New Function: OpenAI Routing Logic ---
def route_query_with_ollama(user_text: str) -> str:
    prompt = f"""
You are an intelligent request router. You need to decide whether to route a user's disaster request to a 'REQUEST_INTAKE_AGENT', 'CHAT_BOT_AGENT', 'TIPS_AGENT', or 'SEARCH_AGENT'.
- The 'REQUEST_INTAKE_AGENT' handles initial intake of disaster requests.
- The 'CHAT_BOT_AGENT' is a conversational agent that can answer questions and provide information.
- The 'TIPS_AGENT' provides safety tips and advice for disaster preparedness.
- The 'SEARCH_AGENT' answers questions using a general web search engine. Use this agent for general knowledge questions, current events, or anything not specifically tied to the local knowledge base.

User query: "{user_text}"

Based on the query, which agent is more appropriate? If the user query contain data of a disaster and affected count value is there then pick the 'REQUEST_INTAKE_AGENT'.
Respond with ONLY 'REQUEST_INTAKE_AGENT', 'CHAT_BOT_AGENT', 'TIPS_AGENT', 'SEARCH_AGENT'.
"""
    try:
        messages=[
        {"role": "system", "content": "You are an intelligent request router helping to decide which agent to route a disaster request to."},
        {"role": "user", "content": prompt}
        ]
        response = llm.invoke(messages)
        print(f"Ollama response: {response.content}")  # Log the response for debugging
        # Extract the choice from the response
        choice = response.content.strip().upper()  # Normalize to uppercase for consistency
        
        if choice == 'REQUEST_INTAKE_AGENT':
            return REQUEST_INTAKE_AGENT
        elif choice == 'CHAT_BOT_AGENT':
            return CHAT_BOT_AGENT
        elif choice == 'TIPS_AGENT':
            return TIPS_AGENT
        elif choice == 'SEARCH_AGENT':
            return SEARCH_AGENT
        else:
            print(f"Unknown agent choice: {choice}. Defaulting to Search Agent.")
            return SEARCH_AGENT
            
    except Exception as e:
        print(f"Error calling Ollama for routing: {e}. Defaulting to Search.")
        return SEARCH_AGENT

# Endpoint to serve the Gateway Agent Card
@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(AGENT_CARD)

# Endpoint to handle and route task requests
@app.post("/tasks/send")
def handle_task():
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id")
    if not task_id:
         task_id = str(uuid.uuid4()) # Generate one if missing, though A2A spec implies it should exist
         task_request['id'] = task_id

    # Extract user's message text from the request
    try:
        user_text = task_request["message"]
    except (KeyError, IndexError, TypeError) as e:
        print(f"Error extracting user text: {e}") # Log error
        return jsonify({"error": "Bad message format"}), 400

    # --- Determine target agent using Ollama ---
    target_agent_url = route_query_with_ollama(user_text)
    print(f"Routing task {task_id} via Ollama decision to Agent ({target_agent_url})")
    # --- End Ollama Routing ---


    # Forward the task to the selected agent
    target_send_url = f"{target_agent_url}/tasks/send"
    try:
        response = requests.post(target_send_url, json=task_request, timeout=60)
        # response.raise_for_status()
        print("This is from intake agent", response.json())
       
    except requests.exceptions.RequestException as e:
        print(f"Error forwarding task {task_id} to {target_agent_url}: {e}") # Log error
        # Return an error task response to the original client
        error_response_task = {
            "id": task_id,
            "status": {"state": "failed", "reason": f"Failed to contact downstream agent: {target_agent_url}"},
            "agent":"gateway_agent",
            "messages": [
                task_request.get("message", {}), # include original user message
                 {
                    "role": "gateway-agent",
                    "error": [{"text": f"Error: Could not reach the target agent at {target_agent_url}. Details: {e}"}]
                }
            ]
        }
        return jsonify(error_response_task), 502 # Bad Gateway
    
    # Return the response from the downstream agent
    print(f"Received response for task {task_id} from {target_agent_url} and this is response: {response.json()}")
    return jsonify(response.json())


if __name__ == "__main__":
    # Ensure port is integer
    port = int(os.environ.get("PORT", 5005))
    print(f"Gateway server starting on port {port}")
    app.run(host="0.0.0.0", port=port) 