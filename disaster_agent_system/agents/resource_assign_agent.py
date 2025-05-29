import asyncio
from typing import Any, AsyncIterable, Dict, Literal, List
from flask import Flask, json, request, jsonify
from dotenv import load_dotenv
import os
import uuid
import math
from pydantic import BaseModel
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import AIMessage, ToolMessage
import requests

load_dotenv()

memory = MemorySaver()

app = Flask(__name__)

class AllocatedResource(BaseModel):
    resource_id: str
    resource_type: str
    location: List[float]  # [latitude, longitude]
    distance_meters: float
    availability_status: str
    contact_info: str

class ResourceAllocationResponseFormat(BaseModel):
    """Respond to the user in this format."""
    status: Literal['pending', 'allocated', 'insufficient_resources', 'error'] = 'pending'
    allocation_status: Literal['pending', 'completed', 'error'] = 'pending'
    allocated_resources: List[AllocatedResource] = []
    allocation_message: str
    total_resources_found: int = 0
    request_location: List[float] = []  # [latitude, longitude]

class ResourceAllocationAgent:

    # Agent Card metadata
    AGENT_CARD = {
        "name": "RESOURCE_ALLOCATION_AGENT",
        "title": "Resource Allocation Agent",
        "description": "Allocate disaster response resources based on location proximity and availability.",
        "url": "http://localhost:5012",  # base URL where this agent is hosted
        "version": "1.0",
        "capabilities": {
            "streaming": False,
            "pushNotifications": False
        }
    }

    SYSTEM_INSTRUCTION = (
        'You are an intelligent resource allocation agent for disaster management.' 
        'Your task is to allocate appropriate resources based on the disaster request location and type.'
        'Find resources within 1000 meters radius of the disaster location.'
        'Prioritize resources based on distance (closer is better) and availability status.'
        'Respond in the following JSON format:'
        '''
        {
            "status": "pending" | "allocated" | "insufficient_resources" | "error",
            "allocation_status": "pending" | "completed" | "error",
            "allocated_resources": [
                {
                    "resource_id": "<string>",
                    "resource_type": "<string>",
                    "location": [<latitude>, <longitude>],
                    "distance_meters": <float>,
                    "availability_status": "<string>",
                    "contact_info": "<string>"
                }
            ],
            "allocation_message": "<string>",
            "total_resources_found": <int>,
            "request_location": [<latitude>, <longitude>]
        }'''
    )

    def __init__(self, tools):
        self.llm = ChatOllama(model="llama3.1:8b", temperature=0.3)
        self.tools = tools
        self.resources_data = self.load_resources_data()

        self.graph = create_react_agent(
            self.llm,
            tools=self.tools,
            checkpointer=memory,
            prompt=self.SYSTEM_INSTRUCTION,
            response_format=ResourceAllocationResponseFormat,
        )

    def load_resources_data(self):
        """Load resources data from JSON file"""
        try:
            resources_file_path = os.path.join("disaster_agent_system", "data", "resources.json")
            with open(resources_file_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Return sample data if file doesn't exist
            return {
                "resources": [
                    {
                        "resource_id": "FIRE_001",
                        "resource_type": "Fire Truck",
                        "location": [6.9271, 79.8612],  # Colombo coordinates
                        "availability_status": "available",
                        "contact_info": "+94-11-2691691",
                        "capacity": "High pressure water system"
                    },
                    {
                        "resource_id": "MED_001",
                        "resource_type": "Ambulance",
                        "location": [6.9344, 79.8428],
                        "availability_status": "available",
                        "contact_info": "+94-11-1990",
                        "capacity": "Emergency medical services"
                    },
                    {
                        "resource_id": "POLICE_001",
                        "resource_type": "Police Unit",
                        "location": [6.9147, 79.8734],
                        "availability_status": "busy",
                        "contact_info": "+94-11-2433333",
                        "capacity": "Traffic control and security"
                    },
                    {
                        "resource_id": "RESCUE_001",
                        "resource_type": "Rescue Team",
                        "location": [6.9319, 79.8478],
                        "availability_status": "available",
                        "contact_info": "+94-11-2697697",
                        "capacity": "Search and rescue operations"
                    }
                ]
            }

    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula"""
        R = 6371000  # Earth's radius in meters
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lon = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_lat / 2) * math.sin(delta_lat / 2) +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lon / 2) * math.sin(delta_lon / 2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c

    def find_nearby_resources(self, disaster_location, disaster_type, radius_meters=1000):
        """Find resources within specified radius of disaster location"""
        if not disaster_location or len(disaster_location) != 2:
            return []
        
        disaster_lat, disaster_lon = disaster_location
        nearby_resources = []
        
        for resource in self.resources_data.get("resources", []):
            resource_lat, resource_lon = resource["location"]
            distance = self.calculate_distance(disaster_lat, disaster_lon, resource_lat, resource_lon)
            
            if distance <= radius_meters:
                allocated_resource = AllocatedResource(
                    resource_id=resource["resource_id"],
                    resource_type=resource["resource_type"],
                    location=resource["location"],
                    distance_meters=round(distance, 2),
                    availability_status=resource["availability_status"],
                    contact_info=resource["contact_info"]
                )
                nearby_resources.append(allocated_resource)
        
        # Sort by distance (closest first) and then by availability
        nearby_resources.sort(key=lambda x: (x.distance_meters, x.availability_status != "available"))
        
        return nearby_resources

    async def invoke(self, query, sessionId, disaster_request_data) -> Dict[str, Any]:
        config = {'configurable': {'thread_id': sessionId}}
        
        # Extract location and disaster type from previous agent response
        disaster_location = disaster_request_data.get("location")
        disaster_type = disaster_request_data.get("type", "general")
        
        # Find nearby resources
        nearby_resources = self.find_nearby_resources(disaster_location, disaster_type)
        
        # Create allocation response
        if nearby_resources:
            # Filter available resources first
            available_resources = [r for r in nearby_resources if r.availability_status == "available"]
            
            if available_resources:
                allocation_response = ResourceAllocationResponseFormat(
                    status="allocated",
                    allocation_status="completed",
                    allocated_resources=available_resources,
                    allocation_message=f"Successfully allocated {len(available_resources)} resources within 1000m radius.",
                    total_resources_found=len(nearby_resources),
                    request_location=disaster_location
                )
            else:
                allocation_response = ResourceAllocationResponseFormat(
                    status="insufficient_resources",
                    allocation_status="completed",
                    allocated_resources=nearby_resources,  # Include busy resources as backup
                    allocation_message=f"Found {len(nearby_resources)} resources but none are currently available. Showing all nearby resources.",
                    total_resources_found=len(nearby_resources),
                    request_location=disaster_location
                )
        else:
            allocation_response = ResourceAllocationResponseFormat(
                status="insufficient_resources",
                allocation_status="completed",
                allocated_resources=[],
                allocation_message="No resources found within 1000m radius of the disaster location.",
                total_resources_found=0,
                request_location=disaster_location
            )
        
        return {
            'is_task_complete': True,
            'require_user_input': False,
            'content': allocation_response,
        }

    async def stream(self, query, sessionId, disaster_request_data) -> AsyncIterable[Dict[str, Any]]:
        inputs = {'messages': [('user', query)]}
        config = {'configurable': {'thread_id': sessionId}}

        for item in self.graph.stream(inputs, config, stream_mode='values'):
            message = item['messages'][-1]
            if isinstance(message, AIMessage) and message.tool_calls and len(message.tool_calls) > 0:
                yield {
                    'is_task_complete': False,
                    'require_user_input': False,
                    'content': 'Searching for nearby resources...',
                }
            elif isinstance(message, ToolMessage):
                yield {
                    'is_task_complete': False,
                    'require_user_input': False,
                    'content': 'Allocating resources based on proximity and availability...',
                }

        yield await self.invoke(query, sessionId, disaster_request_data)

    SUPPORTED_CONTENT_TYPES = ['text', 'text/plain']

# Endpoint to serve the Agent Card
@app.get("/.well-known/agent.json")
def get_agent_card():
    return jsonify(ResourceAllocationAgent.AGENT_CARD)

async def get_agent_response(task_request, task_id):
    """Process the agent response"""
    try:
        instructions = task_request.get("message", "")
        request_verify_response = task_request.get("request-verify-agent-response", [])
        initial_request = task_request.get("initial_request", [])
        
        # Extract disaster request data from previous agents
        disaster_request_data = {}
        if initial_request and len(initial_request) > 0:
            disaster_request_data = initial_request[0].get("response", {})
        
        print(f"Resource Allocation Agent received task {task_id}")
        print(f"Instructions: '{instructions}'")
        print(f"Request verify response: {request_verify_response}")
        print(f"Disaster request data: {disaster_request_data}")
        
    except (KeyError, IndexError, TypeError) as e:
        print(f"Error extracting data for task {task_id}: {e}")
        return {"error": "Bad message format"}, 400
    
    try:
        # Create agent
        print("Creating Resource Allocation agent...")
        tools = []  # Add tools here if needed
        agent = ResourceAllocationAgent(tools)

        # Process allocation
        print("Processing resource allocation...")
        response = await agent.invoke(instructions, task_id, disaster_request_data)
        return response
        
    except Exception as e:
        print(f"Error processing task {task_id}: {e}")
        return {"error": str(e)}, 500

# Endpoint to handle task 
@app.post("/tasks/send")
def handle_task():
    DISPATCH_AGENT = "http://localhost:5013"  # Next agent in the chain
    task_request = request.get_json()
    if not task_request:
        return jsonify({"error": "Invalid request"}), 400

    task_id = task_request.get("id", str(uuid.uuid4()))

    try:
        # Run the async agent response
        response = asyncio.run(get_agent_response(task_request, task_id))
        
        if isinstance(response, tuple):  # Error case
            error_data, status_code = response
            return jsonify(error_data), status_code
            
        response_format = response['content']
        response_format_dict = response_format.model_dump()

        # Formulate A2A response Task for next agent
        response_task = {
            "id": task_id,
            "status": "resource-allocation-agent-completed",
            "initial_request": task_request.get("initial_request", {}),
            "request-verify-response": task_request.get("request-verify-agent-response", {}),
            "next-agent": "dispatch-agent",
            "message": '''Forwarding to Dispatch Agent. 
                         Please coordinate the dispatch of allocated resources to the disaster location.
                         Update resource status and send notifications to relevant personnel.
                         Provide estimated arrival times and dispatch confirmation.''',
            "resource-allocation-agent-response": [
                {
                    "role": "resource-allocation-agent",
                    "response": response_format_dict,
                }
            ]
        }
        
        print(f"Forwarding task {task_id} to dispatch agent")
        print(f"Response: {response_task}")
        
        target_agent_url = DISPATCH_AGENT
        target_send_url = f"{target_agent_url}/tasks/send"

        try:
            if response_task.get("next-agent") == "dispatch-agent":
                dispatch_response = requests.post(target_send_url, json=response_task, timeout=60)
                dispatch_response.raise_for_status()
                return jsonify(dispatch_response.json())
            else:
                print(f"Next agent is not dispatch-agent, returning current response")
                return jsonify(response_task), 200
                
        except requests.exceptions.RequestException as e:
            print(f"Error forwarding task {task_id} to dispatch agent: {e}")
            error_response_task = {
                "id": task_id,
                "status": {"state": "failed", "reason": f"Failed to contact dispatch agent: {target_agent_url}"},
                "messages": [
                    task_request.get("message", {}),
                    {
                        "role": "resource-allocation-agent",
                        "parts": [{"text": f"Error contacting dispatch agent at {target_agent_url}. Details: {e}"}]
                    }
                ]
            }
            return jsonify(error_response_task), 502

    except Exception as e:
        print(f"Resource Allocation Agent error: {e}")
        error_response_task = {
            "id": task_id,
            "status": {"state": "failed", "reason": f"Agent processing failed: {e}"},
            "messages": [
                task_request.get("message", {}),
                {
                    "role": "resource-allocation-agent",
                    "parts": [{"text": f"Resource allocation failed. Details: {e}"}]
                }
            ]
        }
        return jsonify(error_response_task), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5012))
    print(f"Resource Allocation Agent server starting on port {port}")
    app.run(host="0.0.0.0", port=port)