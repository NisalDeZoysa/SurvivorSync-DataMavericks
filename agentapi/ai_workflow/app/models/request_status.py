from enum import Enum
from pydantic import BaseModel
from typing import Dict, Any

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
