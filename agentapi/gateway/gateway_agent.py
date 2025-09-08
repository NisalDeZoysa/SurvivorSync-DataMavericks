from flask import Blueprint, jsonify, request
import uuid

import requests
from agentapi.ai_workflow.agents import run_agent_workflow
import os
from pydantic import BaseModel

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Create if not exists

gateway_bp = Blueprint('gateway_bp', __name__)

AGENT_CHAIN = {
    "tips-agent": "http://localhost:5003",
}

# ---------------- Utility ----------------
def to_serializable(obj):
    """
    Recursively convert Pydantic models and other non-JSON-serializable
    objects into dicts/lists/primitive types for jsonify().
    """
    if isinstance(obj, BaseModel):
        return obj.model_dump()
    elif isinstance(obj, list):
        return [to_serializable(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    else:
        return str(obj)  # fallback: convert unknown objects to string


# ---------------- Routes ----------------

# Endpoint 1: /api/tip
@gateway_bp.route('/api/tip', methods=['POST'])
def get_tip():
    user_text = request.json.get("message", "")
    response = requests.post(f"{AGENT_CHAIN['tips-agent']}/tasks/send", json={"message": user_text})
    try:
        return jsonify(response.json()), response.status_code
    except Exception:
        return jsonify({"error": "Tips agent did not return JSON", "content": response.text}), 500


# Endpoint 2: /api/agent
@gateway_bp.route('/api/agent', methods=['POST'])
def agent_action():
    # Parse JSON request body
    form_data = request.get_json()
    if not form_data:
        return jsonify({"error": "Invalid request, expected JSON"}), 400

    print(f"Form Data: {form_data}")

    # Build state for the workflow
    workflow_input = {
        "input": form_data,
    }

    workflow_result = run_agent_workflow(workflow_input)

    # Ensure workflow_result is JSON serializable
    workflow_result = to_serializable(workflow_result)

    response_data = {
        "input": form_data.get("message"),
        "workflow_result": workflow_result,
        "status": "Agent action processed"
    }

    return jsonify(response_data), 201


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from python_a2a import A2AClient, Message, TextContent, MessageRole
import asyncio

app = FastAPI()

# Agent cards for discovery


# Create A2A clients to talk to Tips and Workflow agents
tips_agent_client = A2AClient("http://localhost:8002/a2a")
workflow_agent_client = A2AClient("http://localhost:8001/a2a")

class TaskRequest(BaseModel):
    agent: str  # "tips" or "workflow"
    input: str

