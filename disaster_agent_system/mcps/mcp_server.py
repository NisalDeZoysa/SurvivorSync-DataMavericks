from collections import defaultdict
import datetime
import math
from typing import Any, Dict, List, Tuple
import mysql.connector
from mcp.server.fastmcp import FastMCP
from PIL import Image
import requests
from transformers import BlipProcessor, BlipForConditionalGeneration, WhisperProcessor, WhisperForConditionalGeneration
import torchaudio
import soundfile as sf
import torch

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load models and processors
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

whisper_processor = WhisperProcessor.from_pretrained("openai/whisper-tiny")
whisper_model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-tiny").to(device)
BRAVE_API_KEY = "BSAj0WMUi25G77DSmwBaAVWGVZ9HSHJ"

mcp = FastMCP("mcp-server")

TOOL_INSTRUCTIONS = """
You can perform the following tasks in this MCP server:
- track_resources: Track resources based on location for a single disaster request ID.
- assign_resources: Assign resources from multiple resource centers to a disaster request.
- change_status_after_assign_resources: Change the status of a disaster request after resources are assigned.
- get_disaster_requests_from_lat_long: Fetch and print all requests based on location and disaster ID on the current day within ~5km.
- image_voice_caption: Caption an image and transcribe voice from audio file.
- web_search: Perform a web search using the Brave Search API.
"""

@mcp.tool()
def get_disaster_requests_from_lat_long(lat: float, long: float, disasterId: int) -> dict:
    """
    Fetch and print all requests based on location and disaster ID on the current day within ~5km,
    then return the matching rows.
    """
    try:
        now = datetime.datetime.now()
        today_start = datetime.datetime.combine(now.date(), datetime.time.min)
        tomorrow_start = today_start + datetime.timedelta(days=1)
        print(f"Today's date: {today_start}, Tomorrow's date: {tomorrow_start}")

        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="survivorsync"
        )
        cursor = conn.cursor()

        cursor.execute("SELECT NOW()")
        print(f"MySQL Server Time: {cursor.fetchone()[0]}")

        query = """
            SELECT * FROM disaster_requests
            WHERE disasterId = %s
            AND created_at >= %s AND created_at < %s
            AND ST_Distance_Sphere(
                POINT(longitude, latitude),
                POINT(%s, %s)
            ) <= 10000
            """

        cursor.execute(query, (disasterId, today_start, tomorrow_start, long, lat))
        disaster_data = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "disaster_data": disaster_data,
            "message": f"Found {len(disaster_data)} requests for disaster ID {disasterId} near coordinates ({lat}, {long}) on {now.date()}."
        }
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return {
            "error": f"Database error: {err}"
        }
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            "error": f"Unexpected error: {e}"
        }
        
@mcp.tool()
async def verify_disaster_request(request_id: int, verification_status: str) -> dict:
    """
    If the disaster request is verified, go to mysql and update the status to 'verified'.
    If the request is not verified, return an error message.
    """
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="survivorsync"
        )
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM disaster_requests WHERE id = %s", (request_id,))
        request = cursor.fetchone()
        if not request:
            return {
                "error": f"No disaster request found with ID {request_id}",
                "results": {
                    "status": "not_found",
                }
            }
        if request.get("status") == "IN_PROGRESS":
            return {
                "message": f"Disaster request {request_id} is already IN_PROGRESS.",
                "results": request
            }
        # Update the disaster request status to 'VERIFIED' if verification_status is 'verified'
        if verification_status.lower() != "verified":
            return {
                "error": f"Disaster request {request_id} is not verified.",
                "results": {
                    "status": "NOT_VERIFIED",
                    "disaster_request": request
                }
        }
        # update status and isVerified in the database
        update_query = "UPDATE disaster_requests SET status = 'VERIFIED', isVerified = TRUE WHERE id = %s"
        cursor.execute(update_query, ( request_id,))
        conn.commit()
        cursor.close()
        conn.close()
        return {
            "message": f"Disaster request {request_id} has been verified and status updated.",
            "results": {
                "status": "VERIFIED",
                "disaster_request": request
            }
        }
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return {
            "error": f"Database error: {err}",
            "results": {}
        }
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            "error": f"Unexpected error: {e}",
            "results": {}
        }
    finally:
        print("Database connection closed.")
    
@mcp.tool()
def track_resources(request_id: int) -> dict:
    """
    Track resources based on location for a single disaster request ID.
    Returns nearby resource centers (within 10 km).
    """
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="survivorsync"
        )
        cursor = conn.cursor(dictionary=True)

        # Get the disaster request
        cursor.execute("SELECT * FROM disaster_requests WHERE id = %s", (request_id,))
        disaster = cursor.fetchone()

        if not disaster:
            return {
                "error": f"No disaster request found with ID {request_id}",
                "results": {}
            }

        lat = disaster.get("latitude")
        lon = disaster.get("longitude")

        if lat is None or lon is None:
            return {
                "disaster": disaster,
                "resources": [],
                "error": "Missing latitude or longitude for disaster request"
            }

        # Find nearby resource centers within 10km
        # Find nearby resource centers within 10km (uses correct column names)
        resource_query = """
            SELECT *, 
            ST_Distance_Sphere(POINT(`long`, `lat`), POINT(%s, %s)) AS distance
            FROM resource_centers
            WHERE ST_Distance_Sphere(POINT(`long`, `lat`), POINT(%s, %s)) <= 10000
        """
        cursor.execute(resource_query, (lon, lat, lon, lat))
        resources = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "disaster": disaster,
            "resources": resources,
            "status": "success",
            "message": f"Found {len(resources)} resource center(s) near disaster ID {request_id}"
        }

    except mysql.connector.Error as err:
        return {
            "error": str(err),
            "results": {}
        }
    except Exception as e:
        return {
            "error": str(e),
            "results": {}
        }

@mcp.tool()
def optimize_resources_for_request(request: Dict[str, Any], resources: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Optimize resource assignment for a single emergency request from multiple resource centers.
    
    Args:
        request: Emergency request containing:
            - request_id: unique identifier
            - location: [latitude, longitude]
            - required_resources: list of {'name': str, 'quantity': int}
            - (other fields as defined in DisasterRequestResponseFormat)
            
        resources: List of resource centers, each containing:
            - resource_center_id: unique identifier
            - location: [latitude, longitude]
            - name: resource type
            - quantity: available quantity
    
    Returns:
        Dictionary containing:
            - status: 'completed', 'pending', or 'error'
            - request_id: original request ID
            - assignment: list of resource assignments
            - shortfalls: list of unmet resources
            - total_distance: sum of distances for all assignments
    """
    
    def euclidean_distance(coord1: List[float], coord2: List[float]) -> float:
        """Calculate Euclidean distance between two points."""
        return math.sqrt((coord1[0]-coord2[0])**2 + (coord1[1]-coord2[1])**2)

    # Validate inputs
    if not request:
        return {"status": "error", "message": "Missing emergency request"}
    
    if not resources:
        return {"status": "error", "message": "No resources available"}
    
    # Extract request details
    request_id = request["request_id"]
    request_loc = request["location"]
    required_resources = request.get("required_resources", [])
    
    # Convert required resources to dictionary
    required_dict = defaultdict(int)
    for item in required_resources:
        required_dict[item["name"]] += item["quantity"]
    
    # Aggregate resources by center
    centers = {}
    for res in resources:
        center_id = res["resource_center_id"]
        if center_id not in centers:
            centers[center_id] = {
                "id": center_id,
                "location": res["location"],
                "resources": defaultdict(int),
                "distance": euclidean_distance(request_loc, res["location"])
            }
        centers[center_id]["resources"][res["name"]] += res["quantity"]
    
    center_list = list(centers.values())
    n = len(center_list)
    
    # Helper function to evaluate a solution
    def evaluate_solution(selected_centers: List[Dict]) -> Tuple[float, Dict]:
        """Evaluate a solution and return (total_distance, resource_shortfall)"""
        allocated = defaultdict(int)
        total_distance = 0
        
        for center in selected_centers:
            total_distance += center["distance"]
            for res, qty in center["resources"].items():
                allocated[res] += qty
        
        shortfall = {}
        for res, need in required_dict.items():
            if allocated[res] < need:
                shortfall[res] = need - allocated[res]
                
        return total_distance, shortfall

    # Optimization strategies
    def greedy_optimization() -> List[Dict]:
        """Greedy algorithm for large number of resource centers"""
        selected = []
        remaining_demand = required_dict.copy()
        
        while any(remaining_demand.values()):
            best_center = None
            best_benefit = 0
            
            for center in center_list:
                if center in selected:
                    continue
                    
                benefit = 0
                for res, available in center["resources"].items():
                    if res in remaining_demand:
                        benefit += min(available, remaining_demand[res]) / center["distance"]
                
                if benefit > best_benefit:
                    best_benefit = benefit
                    best_center = center
            
            if not best_center:
                break
                
            selected.append(best_center)
            for res, available in best_center["resources"].items():
                if res in remaining_demand:
                    taken = min(available, remaining_demand[res])
                    remaining_demand[res] -= taken
        
        return selected

    def exhaustive_search() -> List[Dict]:
        """Exhaustive search for small number of resource centers"""
        best_solution = []
        best_distance = float('inf')
        best_shortfall = None
        
        # Generate all possible subsets
        for i in range(1, 1 << n):
            subset = [center_list[j] for j in range(n) if i & (1 << j)]
            distance, shortfall = evaluate_solution(subset)
            
            # Prioritize solutions with less shortfall
            shortfall_score = sum(shortfall.values()) if shortfall else 0
            
            if (not best_shortfall and shortfall) or \
               (shortfall_score < sum(best_shortfall.values())) or \
               (shortfall_score == sum(best_shortfall.values()) and distance < best_distance):
                
                best_solution = subset
                best_distance = distance
                best_shortfall = shortfall
        
        return best_solution

    # Select optimization strategy
    if n <= 20:  # Use exhaustive search for small instances
        selected_centers = exhaustive_search()
    else:  # Use greedy for larger instances
        selected_centers = greedy_optimization()

    # Generate assignment details
    assignment = []
    allocated_resources = defaultdict(int)
    remaining_demand = required_dict.copy()
    
    for center in selected_centers:
        center_assignment = {
            "resource_center_id": center["id"],
            "location": center["location"],
            "distance": center["distance"],
            "resources_assigned": []
        }
        
        for res, available in center["resources"].items():
            if res in remaining_demand and remaining_demand[res] > 0:
                taken = min(available, remaining_demand[res])
                center_assignment["resources_assigned"].append({
                    "resource_type": res,
                    "quantity": taken
                })
                allocated_resources[res] += taken
                remaining_demand[res] -= taken
        
        assignment.append(center_assignment)
    
    # Calculate shortfalls
    shortfalls = []
    for res, need in required_dict.items():
        allocated = allocated_resources[res]
        if allocated < need:
            shortfalls.append({
                "resource_type": res,
                "required": need,
                "allocated": allocated,
                "shortfall": need - allocated
            })
    
    # Calculate total distance
    total_distance = sum(center["distance"] for center in selected_centers)
    
    # Prepare response
    response = {
        "status": "completed" if not shortfalls else "pending",
        "request_id": request_id,
        "assignment": assignment,
        "shortfalls": shortfalls,
        "total_distance": total_distance
    }
    
    # Include original request fields
    for field in ["disaster", "disasterId", "disaster_status", "location", 
                  "time", "affected_count", "contact_info", 
                  "image_description", "voice_description", "text_description"]:
        if field in request:
            response[field] = request[field]
    
    return response

@mcp.tool()
async def assign_resources(request_id: int, resource_center_ids: list[int], quantities: list[int]) -> dict:
    """
    Assigns resources from multiple resource centers to a disaster request.
    """
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="survivorsync"
        )
        cursor = conn.cursor(dictionary=True)

        # Check disaster request exists
        cursor.execute("SELECT * FROM disaster_requests WHERE id = %s", (request_id,))
        disaster = cursor.fetchone()
        if not disaster:
            return {
                "error": f"Disaster request with ID {request_id} not found.",
                "results": {}
            }

        # Allocation process
        allocations = []
        for resource_center_id, amount in zip(resource_center_ids, quantities):
            # Insert into allocated_resources
            insert_query = """
                INSERT INTO allocated_resources (disasterRequestId, resourceCenterId, amount, isAllocated)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(insert_query, (request_id, resource_center_id, amount, True))
            allocations.append({
                "disasterRequestId": request_id,
                "resourceCenterId": resource_center_id,
                "amount": amount,
                "isAllocated": True
            })

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "results": allocations,
            "status": "success",
            "message": f"{len(allocations)} resource(s) successfully allocated to disaster request {request_id}."
        }

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return {
            "error": str(err),
            "results": {}
        }
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            "error": str(e),
            "results": {}
        }
        
@mcp.tool()
def change_status_after_assign_resources(request_id: int, status: str) -> dict:
    """
    Change the status of a disaster request.
    """
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="survivorsync"
        )
        cursor = conn.cursor(dictionary=True)

        # Update the disaster request status
        if status.lower() != "success":
            return {
                "error": f"Invalid status '{status}'. Only 'success' allocations are allowed.",
                "results": {}
            }
        update_query = "UPDATE disaster_requests SET status = IN_PROGRESS WHERE id = %s"
        cursor.execute(update_query, (status, request_id))
        conn.commit()

        cursor.close()
        conn.close()

        return {
            "status": "IN_PROGRESS",
            "message": f"Status of disaster request {request_id} changed to '{status}'."
        }

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return {
            "error": str(err),
            "results": {}
        }
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {
            "error": str(e),
            "results": {}
        }


@mcp.tool()
def web_search(query: str) -> dict:
    """Performs a web search using the Brave Search API."""
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
        
    }
    params = {"q": query, "count": 10}
    response = requests.get("https://api.search.brave.com/res/v1/web/search", headers=headers, params=params)
    return response.json()


if __name__ == "__main__":
    mcp.run(transport="stdio")


