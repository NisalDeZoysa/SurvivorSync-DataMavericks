import mysql.connector
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("resource-track")

@mcp.tool()
def track_resources(help_needed_request_ids: list[int]) -> dict:
    """
    Track resources based on location for multiple disaster request IDs.
    """
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="survivorsync"
        )
        cursor = conn.cursor(dictionary=True)

        # Step 1: Fetch all disaster requests matching the given IDs
        format_strings = ",".join(["%s"] * len(help_needed_request_ids))
        disaster_query = f"SELECT * FROM disaster_requests WHERE id IN ({format_strings})"
        cursor.execute(disaster_query, tuple(help_needed_request_ids))
        disasters = cursor.fetchall()

        results = {}

        # Step 2 & 3: For each disaster, find nearby resource centers within 10 km
        resource_query = """
            SELECT * FROM resource_centers
            WHERE ST_Distance_Sphere(
                POINT(longitude, latitude),
                POINT(%s, %s)
            ) <= 10000
        """

        for disaster in disasters:
            lat = disaster.get("latitude")
            long = disaster.get("longitude")
            if lat is None or long is None:
                # Skip if coordinates are missing
                results[disaster["id"]] = {
                    "disaster": disaster,
                    "resources": [],
                    "error": "Missing latitude or longitude"
                }
                continue

            cursor.execute(resource_query, (long, lat))
            resources = cursor.fetchall()

            results[disaster["id"]] = {
                "disaster": disaster,
                "resources": resources,
            }

        cursor.close()
        conn.close()

        return results

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

if __name__ == "__main__":
    mcp.run(transport="stdio")
