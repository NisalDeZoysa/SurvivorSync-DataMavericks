import datetime
import mysql.connector
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("request-count")

@mcp.tool()
def count_requests(lat: float, long: float, type: str) -> int:
    """Count the number of requests based on location and type on the current day within ~5km"""
    
    today = datetime.datetime.now().date()
    tomorrow = today + datetime.timedelta(days=1)

    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="surviorsync"  # Make sure spelling is correct here!
    )
    cursor = conn.cursor()

    query = """
        SELECT COUNT(*) FROM disaster_requests
        WHERE type = %s
        AND date >= %s AND date < %s
        AND ST_Distance_Sphere(POINT(longitude, latitude), POINT(%s, %s)) <= 5000
    """

    cursor.execute(query, (type, today, tomorrow, long, lat))
    (count_decimal,) = cursor.fetchone()
    count = int(count_decimal)

    cursor.close()
    conn.close()

    return count



if __name__ == "__main__":
    mcp.run(transport="stdio")
