import requests

from models.agent_state import AgentState
from models.request_status import RequestStatus
from db.resource_db import requests_fetch, update_request_status
from openai import OpenAI


def request_verify_agent(state: AgentState):
    print("Verifying request...")

    # Get all the disaster which has same details
    res = requests_fetch(state.request.get("location", [0,0]),state.request.get("disaster_id",0))
    # Get number of previous requests
    no_of_previous_requests = len(res.get("disaster_data", []))

    if no_of_previous_requests >=5:
        state.status = "verified"
        update_request_status(state.request.get("request_id"), "verified")
        print("Request verified because it has 5 or more similar previous requests.")
        return state

    print(f"Number of previous requests: {no_of_previous_requests}")

    prompt = f"""
    You are an intelligent request verification agent.

    Your task is to use this request: {state.request} , image_description: {state.image_description} ,voice_description: {state.voice_description}
            1. Verify the disaster request information using disaster and text_description in {state.request} , image_description and voice_description.
            2. Update the status in to "pending", "verified", "invalid" as appropriate and give the reason for the status in very brief text.

    Give the output in the following format:
    {{
        "status": "<status>",
        "reason": "<reason for status>"
    }}

    Rules:
    - If image_description or text_description or voice_description is aligned with the request, status is "verified".
    - If none of the above conditions are met, status is "invalid".
    """
    

    schema = {
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "enum": ["pending", "verified", "invalid"]
            }
        },
        "required": ["status"]
    }
    

    try:
        client = OpenAI()
        # Open API Code
        res = client.responses.parse(
            model="gpt-4o-2024-08-06",
            input=[
                {"role": "system", "content": "Give the proper structured output."},
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            text_format=RequestStatus,
        )

        print(f"Status output: {res}")
        output_status = res.output_parsed.status

        if output_status == "verified":
            # Implement the function to update the database with the verified status
            update_request_status(state.request.get("request_id"), "verified")
            
        state.status = output_status
        state.reason = res.output_parsed.reason
        

        # # Ollama Call
        # res = requests.post(
        #         "https://c6e71855f5ee.ngrok-free.app/api/generate",
        #         headers={"Content-Type": "application/json"},
        #         json={
        #             "model": "qwen3:4b",
        #             "prompt": prompt,
        #             "stream": False,
        #             "options": {"temperature": 0.2},
        #             "format": schema
        #         },
        #     )
        # res.raise_for_status()
        # model_output = res.text.strip()
        # try:
        #     parsed_output = json.loads(model_output)
                
        # except json.JSONDecodeError:
        #         print("⚠️ Model output is not valid JSON:", model_output)
        #         parsed_output = {}

        # response_text = parsed_output.get("response", "")
        # status_res = parse_workflow_response(response_text)
        # print(f"Status output: {status_res}")
        # if status_res.get('status') == "verified":
        #     # Implement the function to update the database with the verified status
        #     update_request_status(state.request.get("request_id"), "verified")

        # state.status = status_res.get('status', '').strip()

    except requests.RequestException as e:
        print(f"❌ Error calling LLM API: {e}")

    return state

def check_verification(state: AgentState) -> str:
    if (
        state.status in ["failed", "invalid", "pending"]
        or state.request is None
    ):
        return "NoExecute"
    return "Execute"
