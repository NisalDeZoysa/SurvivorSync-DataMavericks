from ..models import DisasterRequest
from ..utils.sql_db_client import update_record

class TaskPrioritizationAgent:
    def prioritize(self, disaster_request: DisasterRequest):
        # Simple priority logic based on keywords or location (can be replaced with ML/LLM)
        high_priority_keywords = ["fire", "injured", "urgent", "collapse"]
        priority = 1  # default low

        if any(word in disaster_request.description.lower() for word in high_priority_keywords):
            priority = 10

        disaster_request.priority = priority
        disaster_request.status = "prioritized"
        update_record()
        return disaster_request
