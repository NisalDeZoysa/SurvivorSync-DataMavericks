from ..models import DisasterRequest
from ..utils.sql_db_client import add_record

class DisasterRequestIntakeAgent:
    def intake_request(self, user_id, location, description):
        # Validate and create disaster request record
        request = DisasterRequest(
            user_id=user_id,
            location=location,
            description=description,
            status="received"
        )
        add_record(request)
        return request
