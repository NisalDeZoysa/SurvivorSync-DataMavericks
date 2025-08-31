import re
from models.agent_state import AgentState
from utils.regex_utils import extract_field

def request_intake_agent(state: AgentState):
    print(f"Processing request intake: {state}")
    input_message = state.input['message'] if hasattr(state, 'input') and isinstance(state.input, dict) else str(state)

    request_id = extract_field(r'Request Id: (\d+)', input_message, None)
    disaster = extract_field(r'Disaster: (.+)', input_message, "Not applicable")
    disaster_id = extract_field(r'Disaster ID: (\d+)', input_message, None)
    severity_match = extract_field(r'Severity: (.+)', input_message, '').lower()
    disaster_status = (
        'critical' if 'critical' in severity_match else
        'high' if 'high' in severity_match else
        'medium' if 'medium' in severity_match else
        'low' if 'low' in severity_match else
        'Not applicable'
    )
    loc_match = re.search(r'Latitude ([\d.]+), Longitude ([\d.]+)', input_message, re.IGNORECASE)
    location = [float(loc_match.group(1)), float(loc_match.group(2))] if loc_match else [0.0, 0.0]
    affected_count = extract_field(r'Affected Count: (\d+)', input_message, 0)
    contact_info = extract_field(r'Contact No: (.+)', input_message, "Not applicable")
    image_path = extract_field(r'Image_path: (.+)', input_message, None)
    voice_path = extract_field(r'Voice_path: (.+)', input_message, None)
    text_description = extract_field(r'Details: (.+)', input_message, "Not applicable")

    response_json = {
        "request_id": int(request_id) if request_id else None,
        "disaster": disaster,
        "disaster_id": int(disaster_id) if disaster_id else None,
        "disaster_status": disaster_status,
        "location": location,
        "affected_count": int(affected_count) if affected_count else 0,
        "contact_info": contact_info,
        "image_path": image_path,
        "voice_path": voice_path,
        "text_description": text_description
    }

    state.image_path = image_path
    state.voice_path = voice_path
    state.request = response_json
    return state
