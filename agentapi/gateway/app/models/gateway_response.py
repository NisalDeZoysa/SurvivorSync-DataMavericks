from enum import Enum
from pydantic import BaseModel
from typing import Dict, Any

class GatewayResponse(BaseModel):
    data: Dict[str, Any]