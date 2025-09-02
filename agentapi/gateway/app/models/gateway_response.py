from enum import Enum
from pydantic import BaseModel
from typing import Dict, Any

class GatewayResponse(BaseModel):
    state: Dict[str, Any]

class GatewayRequest(BaseModel):
    input: Dict[str, Any]
    agent: str


