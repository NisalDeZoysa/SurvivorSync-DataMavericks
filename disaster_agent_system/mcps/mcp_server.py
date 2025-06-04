import datetime
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
def verify_disaster_request(requestId: int, verification_status: str) -> dict:
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
        cursor.execute("SELECT * FROM disaster_requests WHERE id = %s", (requestId,))
        request = cursor.fetchone()
        if not request:
            return {
                "error": f"No disaster request found with ID {requestId}",
                "results": {
                    "status": "not_found",
                }
            }
        if request.get("status") == "IN_PROGRESS":
            return {
                "message": f"Disaster request {requestId} is already IN_PROGRESS.",
                "results": request
            }
        # Update the disaster request status to 'VERIFIED' if verification_status is 'verified'
        if verification_status.lower() != "verified":
            return {
                "error": f"Disaster request {requestId} is not verified.",
                "results": {
                    "status": "NOT_VERIFIED",
                    "disaster_request": request
                }
        }
        update_query = "UPDATE disaster_requests SET status = 'VERIFIED' WHERE id = %s"
        cursor.execute(update_query, ( requestId,))
        conn.commit()
        cursor.close()
        conn.close()
        return {
            "message": f"Disaster request {requestId} has been verified and status updated.",
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
def assign_resources(request_id: int, resource_center_ids: list[int], amounts: list[int]) -> dict:
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
        for resource_center_id, amount in zip(resource_center_ids, amounts):
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


