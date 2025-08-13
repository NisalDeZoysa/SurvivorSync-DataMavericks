import datetime
import mysql.connector
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("near-responders")

@mcp.tool()
def output_requests(lat: float, long: float, disaster_id: int) -> dict:
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

if __name__ == "__main__":
    mcp.run(transport="stdio")


