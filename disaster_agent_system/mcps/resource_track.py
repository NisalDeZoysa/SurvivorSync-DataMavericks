import datetime
import mysql.connector
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("request-count")

@mcp.tool()
def track_resources(lat: float, long: float, disasterId: int) -> list:
    """
    Track resources based on location and disaster ID.
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
        
        disaster = """SELECT * FROM disasters WHERE id = %s"""
        cursor.execute(disaster, (disasterId,))
        disaster_data = cursor.fetchone()

        resources = """
            SELECT * FROM resource_centers
            WHERE ST_Distance_Sphere(
                POINT(longitude, latitude),
                POINT(%s, %s)
            ) <= 10000
            """

        cursor.execute(resources, (disasterId, today_start, tomorrow_start, long, lat))
        resources_data = cursor.fetchall()
        cursor.close()
        conn.close()

        return {
            "disaster": disaster_data,
            "resources": resources_data
        }
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []

if __name__ == "__main__":
    mcp.run(transport="stdio")


