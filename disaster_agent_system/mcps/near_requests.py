import datetime
import mysql.connector
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("near-requests")

@mcp.tool()
def get_disaster_requests_from_lat_long(lat: float, long: float, disaster_id: int) -> dict:
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
            ) <= 20000
            """

        cursor.execute(query, (disaster_id, today_start, tomorrow_start, long, lat))
        disaster_data = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "disaster_data": disaster_data,
            "message": f"Found {len(disaster_data)} requests for disaster ID {disaster_id} near coordinates ({lat}, {long}) on {now.date()}."
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
    

if __name__ == "__main__":
    mcp.run(transport="stdio")


