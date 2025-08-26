from flask import Blueprint, jsonify, request
import uuid
from core.agents import run_agent_workflow
import os
from pydantic import BaseModel

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)  # Create if not exists

gateway_bp = Blueprint('gateway_bp', __name__)

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
@gateway_bp.route('/api/tip', methods=['GET'])
def get_tip():
    tip_data = {
        "message": "Always comment your code!",
        "category": "Programming"
    }
    return jsonify(tip_data), 200


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
