import asyncio
from typing import Any, AsyncIterable, Dict, List, Literal
from flask import Flask, json, request, jsonify
from dotenv import load_dotenv
import os
import uuid
import requests
from pydantic import BaseModel
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage
from datetime import datetime
import math

load_dotenv()

memory = MemorySaver()
app = Flask(__name__)

class ResourceAssignmentResponseFormat(BaseModel):
    status: Literal['assigned', 'partial', 'failed'] = 'assigned'
    resource_assign: Dict[str, Any]
    message: str

class ResourceAssignAgent:
    # Agent Card metadata
    AGENT_CARD = {
        "name": "RESOURCE_ASSIGN_AGENT",
        "title": "Resource Assignment Agent",
        "description": "Assign available resources to disaster requests based on proximity, availability, and priority.",
        "url": "http://localhost:5013",
        "version": "1.0",
        "capabilities": {
            "streaming": False,
            "pushNotifications": False
        }
    }

    SYSTEM_INSTRUCTION = (
        'You are a resource assignment agent for disaster response management.'
        'Your task is to analyze disaster requests and available resources, then create optimal assignments.'
        'Extract information and respond in the following JSON format:'
        '''{
            "status": "assigned" | "partial" | "failed", # "assigned" if all needs met, "partial" if some needs met, "failed" if no assignment possible
            "resource_assign": {
                "request_id": [<int>, <int>, <int>], # List of disaster request IDs
                "resource_center_ids": [<int>, <int>, <int>] # List of assigned resource center IDs
            },
            "message": "<string>" # Summary message about the assignment
        }'''
    )

    def _init_(self, tools):
        self.llm = ChatOllama(model="llama3.1:8b", temperature=0.2)
        self.tools = tools
        self.graph = create_react_agent(
            self.llm,
            tools=self.tools,
            checkpointer=memory,
            prompt=self.SYSTEM_INSTRUCTION,
            response_format=ResourceAssignmentResponseFormat
        )

    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        R = 6371  # Earth's radius in kilometers
        
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat/2)*2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)*2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c

    def assign_resources_logic(self, disaster_requests: List[Dict], available_resources: List[Dict]) -> Dict[str, Any]:
        """Core resource assignment logic"""
        try:
            if not disaster_requests or not available_resources:
                return {
                    "status": "failed",
                    "resource_assign": {
                        "request_id": [],
                        "resource_center_ids": []
                    },
                    "message": "No disaster requests or available resources found"
                }
            
            # Extract request IDs and resource center IDs
            request_ids = []
            assigned_resource_ids = []
            
            # Process each disaster request
            for disaster_request in disaster_requests:
                request_id = disaster_request.get('request_id') or disaster_request.get('id')
                if not request_id:
                    continue
                    
                disaster_location = disaster_request.get('location', [])
                disaster_type = disaster_request.get('type', '').lower()
                disaster_status = disaster_request.get('disaster_status', 'medium')
                
                if not disaster_location or len(disaster_location) < 2:
                    continue
                
                disaster_lat, disaster_lon = float(disaster_location[0]), float(disaster_location[1])
                
                # Resource type priority mapping
                resource_priorities = {
                    'fire': ['fire_station', 'fire_truck', 'ambulance'],
                    'medical': ['hospital', 'ambulance', 'medical_center'],
                    'flood': ['rescue_team', 'emergency_services', 'shelter'],
                    'earthquake': ['rescue_team', 'hospital', 'emergency_services'],
                    'accident': ['ambulance', 'police', 'hospital'],
                    'default': ['emergency_services', 'police', 'ambulance']
                }
                
                preferred_types = resource_priorities.get(disaster_type, resource_priorities['default'])
                
                # Score and rank available resources for this request
                scored_resources = []
                for resource in available_resources:
                    if not resource.get('available', True):
                        continue
                    
                    resource_id = resource.get('id') or resource.get('resource_id')
                    if not resource_id or resource_id in assigned_resource_ids:
                        continue  # Skip if already assigned
                    
                    # Get resource location
                    res_location = resource.get('location', {})
                    if not res_location.get('latitude') or not res_location.get('longitude'):
                        continue
                    
                    res_lat = float(res_location['latitude'])
                    res_lon = float(res_location['longitude'])
                    
                    # Calculate distance
                    distance = self.calculate_distance(disaster_lat, disaster_lon, res_lat, res_lon)
                    
                    # Calculate priority score
                    resource_type = resource.get('type', '').lower()
                    
                    # Type priority score
                    type_score = 0
                    if resource_type in preferred_types:
                        type_score = (len(preferred_types) - preferred_types.index(resource_type)) * 10
                    
                    # Distance penalty (closer = better)
                    distance_penalty = min(distance * 0.8, 30)
                    
                    # Capacity score
                    capacity_score = min(resource.get('capacity', 1) * 2, 20)
                    
                    total_score = type_score + capacity_score - distance_penalty
                    
                    scored_resources.append({
                        'resource_id': resource_id,
                        'score': total_score,
                        'distance': distance
                    })
                
                # Sort by score and select the best resource
                if scored_resources:
                    scored_resources.sort(key=lambda x: x['score'], reverse=True)
                    
                    # Determine number of resources based on disaster severity
                    num_resources = {
                        'low': 1,
                        'medium': 2,
                        'high': 3,
                        'critical': 4
                    }.get(disaster_status, 2)
                    
                    # Assign top resources
                    for i in range(min(num_resources, len(scored_resources))):
                        resource_id = scored_resources[i]['resource_id']
                        if resource_id not in assigned_resource_ids:
                            request_ids.append(int(request_id))
                            assigned_resource_ids.append(int(resource_id))
            
            # Determine status based on assignment success
            if not request_ids or not assigned_resource_ids:
                status = "failed"
                message = "No successful resource assignments could be made"
            elif len(request_ids) == len(disaster_requests):
                status = "assigned"
                message = f"Successfully assigned resources to {len(request_ids)} disaster requests"
            else:
                status = "partial"
                message = f"Partially assigned resources to {len(request_ids)} out of {len(disaster_requests)} disaster requests"
            
            return {
                "status": status,
                "resource_assign": {
                    "request_id": request_ids,
                    "resource_center_ids": assigned_resource_ids
                },
                "message": message
            }
            
        except Exception as e:
            return {
                "status": "failed",
                "resource_assign": {
                    "request_id": [],
                    "resource_center_ids": []
                },
                "message": f"Assignment processing error: {str(e)}"
            }

    async def invoke(self, query: str, sessionId: str) -> Dict[str, Any]:
        try:
            # Parse the query to extract disaster requests and resource data
            query_data = json.loads(query) if isinstance(query, str) else query
            
            disaster_requests = query_data.get('disaster_requests', [])
            available_resources = query_data.get('resources', [])
            
            # Perform resource assignment using internal logic
            result = self.assign_resources_logic(disaster_requests, available_resources)
            
            return {
                'is_task_complete': True,
                'require_user_input': False,
                'content': ResourceAssignmentResponseFormat(**result),
            }
            
        except Exception as e:
            return {
                'is_task_complete': False,
                'require_user_input': True,
                'content': f'Resource assignment failed: {str(e)}',
            }

# Endpoint to serve the Agent Card
@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(ResourceAssignAgent.AGENT_CARD)

async def get_agent_response(task_request, task_id):
    try:
        # Extract resource tracking agent response
        resource_tracking_response = task_request.get("resource-tracking-agent-response", {})
        
        if not resource_tracking_response:
            print(f"No resource tracking data found for task {task_id}")
            return {
                'is_task_complete': False,
                'require_user_input': True,
                'content': 'No resource tracking data available for assignment',
            }
        
        # Extract disaster requests and resources data
        tracking_data = resource_tracking_response.get("response", {})
        
        # Handle both single disaster and multiple disaster requests
        disaster_data = tracking_data.get("disaster", {})
        disaster_requests = tracking_data.get("disaster_requests", [])
        
        # If single disaster, convert to list format
        if disaster_data and not disaster_requests:
            disaster_requests = [disaster_data]
        
        available_resources = tracking_data.get("resources", [])
        
        print(f"Resource Assignment Agent processing task {task_id}")
        print(f"Found {len(disaster_requests)} disaster requests and {len(available_resources)} available resources")
        
        # Prepare query for agent
        assignment_query = {
            "disaster_requests": disaster_requests,
            "resources": available_resources
        }
        
        # Create agent and process assignment
        tools = []  # No external tools needed for assignment logic
        agent = ResourceAssignAgent(tools)
        
        response = await agent.invoke(json.dumps(assignment_query), task_id)
        return response
        
    except Exception as e:
        print(f"Error in resource assignment for task {task_id}: {e}")
        return {
            'is_task_complete': False,
            'require_user_input': True,
            'content': f'Resource assignment failed: {str(e)}',
        }

# Endpoint to handle task 
@app.post("/tasks/send")
def handle_task():
    NEXT_AGENT_URL = "http://localhost:5014"  # URL of next agent (e.g., notification agent)
    target_agent_url = NEXT_AGENT_URL
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id", str(uuid.uuid4()))

    try:
        # Process resource assignment
        response = asyncio.run(get_agent_response(task_request, task_id))
        response_format = response['content']
        response_format_dict = response_format.model_dump() if hasattr(response_format, 'model_dump') else response_format

        # Create full response task following A2A protocol
        full_response_task = {
            # Inherit all previous data
            "resource-assign-agent": {
                "id": task_id,
                "status": "resource-assign-agent-completed",
                "agent": "resource-assign-agent",
                "initial_request": task_request.get("message", {}),
                "next-agent": "notification-agent",
                "message": "Resources have been assigned to the disaster request. Please proceed with notification and dispatch.",
                "resource-assign-agent-response": [
                    {
                        "role": "resource-assign-agent",
                        "response": response_format_dict,
                    }
                ]
            }
        }

        print(f"Resource Assignment completed for task {task_id}")
        print(f"Assignment status: {response_format_dict.get('status', 'unknown')}")
        print(f"Resources assigned: {len(response_format_dict.get('assigned_resources', []))}")

        # Forward to next agent if specified
        if full_response_task["resource-assign-agent"].get("next-agent") and NEXT_AGENT_URL:
            try:
                forward_response = requests.post(f"{NEXT_AGENT_URL}/tasks/send", json=full_response_task, timeout=60)
                forward_response.raise_for_status()
                return jsonify(forward_response.json())
            except requests.exceptions.RequestException as e:
                print(f"Error forwarding task {task_id} to next agent: {e}")
                # Return current response if forwarding fails
                return jsonify(full_response_task), 200

        return jsonify(full_response_task), 200

    except Exception as e:
        print(f"Resource Assignment Agent error for task {task_id}: {e}")
        error_response_task = {
            "resource-assign-agent": {
                "id": task_id,
                "status": {"state": "failed", "reason": f"Failed to contact downstream agent: {target_agent_url}"},
                "agent": "resource-assign-agent",
                "message":[
                    task_request.get("message",{}),
                    {
                        "role": "resource-assign-agent",
                        "error": [{"text": f"Error contacting target agent at {target_agent_url}. Details: {e}"}]
                    }
                ]
                
            }
        }
        return jsonify(error_response_task), 500

if __name__ == "_main_":
    port = int(os.environ.get("PORT", 5013))
    print(f"Resource Assignment Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port)