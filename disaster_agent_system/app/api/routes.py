from flask import Blueprint, request, jsonify
from ..services.disaster_request_service import DisasterRequestService

api_bp = Blueprint("api", __name__)
disaster_service = DisasterRequestService()

@api_bp.route("/disaster-request", methods=["POST"])
def handle_disaster_request():
    data = request.json
    user_id = data.get("user_id")
    location = data.get("location")
    description = data.get("description")

    if not all([user_id, location, description]):
        return jsonify({"error": "Missing required fields"}), 400

    result = disaster_service.process_disaster_request(user_id, location, description)

    return jsonify({
        "message": "Disaster request processed successfully",
        "priority": result["request"].priority,
        "assigned_resources": [r.type for r in result["assigned_resources"]]
    }), 200
