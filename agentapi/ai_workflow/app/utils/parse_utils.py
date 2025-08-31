import json
import re

def parse_workflow_response(response_text: str):
    response_text = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL).strip()
    print("Cleaned response text:", response_text)

    json_match = re.search(r'(\{.*\})', response_text, flags=re.DOTALL)
    if not json_match:
        return {}

    json_text = json_match.group(1)

    try:
        return json.loads(json_text)
    except json.JSONDecodeError:
        fixed = json_text.replace("'", '"')
        fixed = re.sub(r",\s*}", "}", fixed)
        fixed = re.sub(r",\s*]", "]", fixed)
        try:
            return json.loads(fixed)
        except Exception:
            return {}
