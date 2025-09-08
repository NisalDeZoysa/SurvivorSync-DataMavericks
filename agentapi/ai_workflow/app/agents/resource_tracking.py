from app.db.resource_db import resource_fetch
from app.models.agent_state import AgentState


def resource_tracking_agent(state: AgentState):
    print("Tracking resources...")

    try:
        request_id = state.request.get("request_id",None)

        print(f"Fetching resources for request_id: {request_id}")

        res = resource_fetch(request_id)

        if res.get("status") != "success":
            print(f"⚠️ Resource fetch failed: {res.get('error', 'Unknown error')}")
            state.available_resources = {}
            return state

        all_available_resources = res.get("resources", [])
        print("Available resources:", all_available_resources)

        state.available_resources = all_available_resources

        # Parse the data to the LLM to  select most suitable resource for the mentioned disaster.
    except Exception as e:
        print(f"⚠️ Resource tracking error: {e}")

    return state
