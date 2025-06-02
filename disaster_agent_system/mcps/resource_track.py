import mysql.connector
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("resource-track")

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

if __name__ == "__main__":
    mcp.run(transport="stdio")
