from pydantic import BaseModel
from typing import Dict, Any

class AgentRequest(BaseModel):
    input: Dict[str, Any]

class AgentResponse(BaseModel):
    state: Dict[str, Any]

class TipsResponse(BaseModel):
    tips: str