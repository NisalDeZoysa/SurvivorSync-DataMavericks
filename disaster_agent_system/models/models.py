import datetime
from typing import Literal
from pydantic import BaseModel, Field

class DisasterRequestResponseFormat(BaseModel):
    """Respond to the user in this format."""

    status: Literal['pending','completed', 'error'] = 'pending'
    request_id: int
    disaster: str
    disaster_id: int
    disaster_status : Literal['low', 'medium', 'high', 'critical'] = 'medium'
    location: list[float]
    time: str
    affected_count: int
    contact_info: str
    image_description: str
    voice_description: str
    text_description: str
    
    
class TipsResponseFormat(BaseModel):
    """Respond to the user in this format."""

    status: Literal['pending','completed', 'error'] = 'pending'
    message: str = Field(..., description="Message containing relevant chatbot response")
    contact_info: str = Field(..., description="Contact information for further assistance")