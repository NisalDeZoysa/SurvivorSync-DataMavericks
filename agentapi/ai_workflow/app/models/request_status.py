from enum import Enum
from pydantic import BaseModel
from typing import Dict, Any, Optional

class StatusEnum(str, Enum):
    pending = "pending"
    verified = "verified"
    invalid = "invalid"

class RequestStatus(BaseModel):
    status: StatusEnum
    reason: str = ""

class WorkflowRequest(BaseModel):
    input: Dict[str, Any]

class WorkflowResponse(BaseModel):
    state: Dict[str, Any]

class RequestIntakeResponse(BaseModel):
    request_id: Optional[int]
    disaster: Optional[str]
    disaster_status: Optional[str]
    location: Optional[list[float]]
    affected_count: Optional[int]
    contact_info: Optional[str]
    text_description: Optional[str]
