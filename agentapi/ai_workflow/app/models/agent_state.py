from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class AllocatedResources(BaseModel):
    request_id: int
    resource_center_ids: List[int]
    quantities: List[int]

class UserMessage(BaseModel):
    message: str

class AgentState(BaseModel):
    input: Optional[Dict[str, Any]] = None
    image_path: Optional[str] = None
    voice_path: Optional[str] = None
    request: Optional[Dict[str, Any]] = None
    image_description: Optional[str] = None
    voice_description: Optional[str] = None
    status: Optional[str] = "pending"
    reason: Optional[str] = None
    available_resources: Optional[List[Dict[str, Any]]] = None
    allocated_resources: Optional[AllocatedResources] = None
    disaster_status: Optional[str] = "PENDING"
    user_msg: Optional[UserMessage] = None
    error_msg: Optional[str] = None
