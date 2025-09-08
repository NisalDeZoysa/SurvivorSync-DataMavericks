import json
import os
import requests

from app.models.agent_state import AgentState
from app.models.request_status import RequestStatus
from app.db.resource_db import requests_fetch, update_request_status
from openai import OpenAI
import dotenv

dotenv.load_dotenv()
NGROK_URL = os.getenv("NGROK_URL")

def request_verify_agent(state: AgentState):
    
    if not NGROK_URL:
        raise ValueError("NGROK_URL is not set in the .env file.")
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

    Your task is to verify this disaster request: {state.request}, using:
        - image_description: {state.image_description}
        - voice_description: {state.voice_description}

    Step-by-step reasoning process:
        1. Carefully read and extract the key details from the disaster request text.
        2. Compare the request details with the image_description.
        3. Compare the request details with the voice_description.
        4. Decide if there is alignment:
            - If image_description OR text_description OR voice_description supports/aligns with the request, mark as "verified".
            - If evidence is partially supportive or unclear, mark as "pending".
            - If no evidence aligns at all, mark as "invalid".
        5. Write a very brief reason for why this status was chosen.

    After reasoning, output only the final JSON result in this exact format:

    {{
        "status": "<status>",   # one of "pending", "verified", or "invalid"
        "reason": "<brief reason for status>"
    }}
    """


    try:
        # client = OpenAI()
        # # Open API Code
        # res = client.responses.parse(
        #     model="gpt-4o-2024-08-06",
        #     input=[
        #         {"role": "system", "content": "Give the proper structured output."},
        #         {
        #             "role": "user",
        #             "content": prompt,
        #         },
        #     ],
        #     text_format=RequestStatus,
        # )

        # print(f"Status output: {res}")
        # output_status = res.output_parsed.status

        # if output_status == "verified":
        #     # Implement the function to update the database with the verified status
        #     update_request_status(state.request.get("request_id"), "verified")
            
        # state.status = output_status
        # state.reason = res.output_parsed.reason
        

        # # Ollama Call
        res = requests.post(
                NGROK_URL + "/api/generate",
                headers={"Content-Type": "application/json"},
                json={
                    "model": "qwen3:4b",
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.2},
                    "format": RequestStatus.model_json_schema(),
                },
            )
        res.raise_for_status()

        api_response = res.json()
        raw_text = api_response["response"]

        try:
            response_dict = json.loads(raw_text)
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON in response: {raw_text}")

        # Validate with Pydantic
        request_status = RequestStatus(**response_dict)

        print("✅ Parsed RequestStatus:", request_status)

        if request_status.status == "verified":
            # Implement the function to update the database with the verified status
            update_request_status(state.request.get("request_id"), "verified")

        state.status = request_status.status
        state.reason = request_status.reason

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
