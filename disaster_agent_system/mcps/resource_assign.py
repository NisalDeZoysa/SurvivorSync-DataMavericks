import mysql.connector
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("resource-assign")


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

if __name__ == "__main__":
    mcp.run(transport="stdio")
