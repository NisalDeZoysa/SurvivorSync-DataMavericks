import re
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
    model="qwen3:4b",
    temperature = 0.2,
    num_predict = 256,
)

app = Flask(__name__)

REQUEST_INTAKE_AGENT = "http://localhost:5010"
TIPS_AGENT = "http://localhost:5003"  # URL for the Tips Agent

AGENT_CARD = {
    "name": "GatewayAgent",
    "description": "Routes requests to either a REQUEST_INTAKE_AGENT or TIPS_AGENT using AI.",
    "url": "http://localhost:5005",
    "version": "1.1",
    "capabilities": {
        "streaming": False,
        "pushNotifications": False
    }
}

def route_query_with_ollama(user_text: str) -> str:
    prompt = f"""
You are an intelligent request router. You need to decide whether to route a user's disaster request to a 'REQUEST_INTAKE_AGENT' or 'TIPS_AGENT'.
- The 'REQUEST_INTAKE_AGENT' handles every disaster request and if the request contain affected counts, disaster location latitude and longitudes and severity levels then it will always route to this agent.
- The 'TIPS_AGENT' This agent is just a bot provide tips and chat with users about disasters, health and safety.

User query: "{user_text}"

If the user query contains data about a disaster and an affected count value, pick 'REQUEST_INTAKE_AGENT'.
If the user is asking for tips, advice, or general safety information, pick 'TIPS_AGENT'.
Respond with ONLY 'REQUEST_INTAKE_AGENT' or 'TIPS_AGENT'.
"""
    try:
        messages=[
            {"role": "system", "content": "You are an intelligent request router helping to decide which agent to route a disaster request to."},
            {"role": "user", "content": prompt}
        ]
        response = llm.invoke(messages)
        clean_response = re.sub(r'<think>.*?</think>', '', str(response.content), flags=re.DOTALL).strip()
        print(f"Ollama response: {clean_response}")
        choice = clean_response.strip().upper()
        if choice == 'REQUEST_INTAKE_AGENT':
            return REQUEST_INTAKE_AGENT
        elif choice == 'TIPS_AGENT':
            return TIPS_AGENT
        else:
            print(f"Unknown agent choice: {choice}. Defaulting to TIPS_AGENT.")
            return REQUEST_INTAKE_AGENT
    except Exception as e:
        print(f"Error calling Ollama for routing: {e}. Defaulting to TIPS_AGENT.")
        return TIPS_AGENT

@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(AGENT_CARD)

@app.post("/tasks/send")
def handle_task():
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id")
    if not task_id:
         task_id = str(uuid.uuid4())
         task_request['id'] = task_id

    try:
        user_text = task_request["message"]
    except (KeyError, IndexError, TypeError) as e:
        print(f"Error extracting user text: {e}")
        return jsonify({"error": "Bad message format"}), 400

    target_agent_url = route_query_with_ollama(user_text)
    print(f"Routing task {task_id} via Ollama decision to Agent ({target_agent_url})")

    target_send_url = f"{target_agent_url}/tasks/send"
    try:
        response = requests.post(target_send_url, json=task_request, timeout=60)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error forwarding task {task_id} to {target_agent_url}: {e}")
        error_response_task = {
            "id": task_id,
            "status": {"state": "failed", "reason": f"Failed to contact downstream agent: {target_agent_url}"},
            "agent":"gateway_agent",
            "messages": [
                task_request.get("message", {}),
                {
                    "role": "gateway-agent",
                    "error": [{"text": f"Error: Could not reach the target agent at {target_agent_url}. Details: {e}"}]
                }
            ]
        }
        return jsonify(error_response_task), 502

    print(f"Received response for task {task_id} from {target_agent_url}")
    return jsonify(response.json())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5005))
    print(f"Gateway server starting on port {port}")
    app.run(host="0.0.0.0", port=port)