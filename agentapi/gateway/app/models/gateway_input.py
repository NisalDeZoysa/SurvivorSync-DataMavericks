from enum import Enum
from pydantic import BaseModel
from typing import Dict, Any

class GatewayRequest(BaseModel):
    input: Dict[str, Any]

