import datetime
import mysql.connector
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("request-count")

@mcp.tool()
def output_requests(lat: float, long: float, disasterId: int) -> list:
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
        rows = cursor.fetchall()

        print(f"Fetched {len(rows)} rows:")
        for row in rows:
            print(row)

        cursor.close()
        conn.close()

        return rows
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return []
    except Exception as e:
        print(f"Unexpected error: {e}")
        return []

if __name__ == "__main__":
    mcp.run(transport="stdio")


