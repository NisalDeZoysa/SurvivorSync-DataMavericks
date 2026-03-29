import json
import os
import requests
from app.models.agent_state import AgentState
from openai import OpenAI
from app.models.agent_state import AllocatedResources
from app.db.resource_db import assign_resources, change_status_after_assign_resources
import dotenv

dotenv.load_dotenv()
NGROK_URL = os.getenv("NGROK_URL")
TRANSCRIBE_URL = os.getenv("TRANSCRIBE_URL")

def resource_assign_agent(state: AgentState):
    
    # if not NGROK_URL:
    #     raise ValueError("NGROK_URL is not set in the .env file.")
    print("Assigning resources...")

    PROMPT = f"""
    You are an intelligent resource assignment agent.
    Your task is to allocate the available resources from {state.available_resources} to the disaster request {state.request}.
         
    Definitions:
        - count = total resources at a center
        - used = already allocated resources
        - available = count - used
        - resourceId = resource center id

    Follow this reasoning process step by step:
        1. Analyze the disaster request details (urgency, type, quantity needed).
        2. List all available resource centers and their current availability.
        3. Apply the rules systematically:
            - Rule 1: Never allocate more than available (no over-allocation).
            - Rule 2: Do not exhaust all resources at once (keep reserves).
            - Rule 3: Consider disaster urgency when deciding quantities.
            - Rule 4: Apply an optimal allocation strategy (balanced + fair).
            - Rule 5: Prioritize centers by proximity and availability.
            - Rule 6: Mark allocated quantities as used after assignment.
        4. Decide how much each resource center should contribute, explaining the reasoning for each choice.
        5. Verify the allocation satisfies all rules and the request demand.

    After reasoning, provide the final output **only in the following JSON format**:

    {{
        "request_id": "<id>",   # id from state.request
        "resource_center_ids": [<list of resource center ids which can assign to this request>],
        "quantities": [<list of quantities corresponding to each resource center id>]
    }}
    """

    try:
        client = OpenAI()
        # Open API Code
        res = client.responses.parse(
            model="gpt-4o-2024-08-06",
            input=[
                {"role": "system", "content": "Give the proper structured output."},
                {
                    "role": "user",
                    "content": PROMPT,
                },
            ],
            text_format=AllocatedResources,
        )

        print(f"Status output: {res}")
        resources = res.output_parsed
        print(f"Allocated Resources: {resources}")
        try:
            assign_complete = assign_resources(resources.request_id, resources.resource_center_ids, resources.quantities)
        except Exception as e:
            print(f"❌ Error assigning resources in DB: {e}")
            assign_complete = False
        if assign_complete:
            print("Resource assignment successful.")
            state.allocated_resources = resources
            response = change_status_after_assign_resources(resources.request_id, "success")
            state.disaster_status = response.get('status')
            print(f"Disaster Status change result: {response.get('status')}")
        else:
            print("Resource assignment failed.")
        
        # Ollama
        # res = requests.post(
        #         NGROK_URL + "/api/generate",
        #         headers={"Content-Type": "application/json"},
        #         json={
        #             "model": "qwen3:4b",
        #             "prompt": PROMPT,
        #             "stream": False,
        #             "options": {"temperature": 0.2},
        #             "format": AllocatedResources.model_json_schema(),
        #         },
        #     )
        # res.raise_for_status()

        # raw_text = res.json()['response']
        # try:
        #     json_output = json.loads(raw_text)
        # except json.JSONDecodeError:
        #     raise ValueError(f"Invalid JSON in response: {raw_text}")
        
        # res_clear = AllocatedResources(**json_output)

        # print(f"Allocated Resources: {res_clear}")

        # # Save the allocation results to the database
        # if res_clear:
        #     try:
        #         response = assign_resources(res_clear.request_id, res_clear.resource_center_ids, res_clear.quantities)
        #         print(f"DB Assignment Response: {response}")
        #     except Exception as e:
        #         print(f"❌ Error assigning resources in DB: {e}")
        #         response = {"status": "failure"}
        #     if response.get("status") == "success":
        #         state.allocated_resources = res_clear
        #         print("Resource allocation successful.")
        #         try:
        #             response = change_status_after_assign_resources(res_clear.request_id, "success")
        #             state.disaster_status = response.get('status')
        #             print(f"Disaster Status change result: {response.get('status')}")
        #         except Exception as e:
        #             state.disaster_status = "failure"
        #             print(f"❌ Error changing status in DB: {e}")
        #     else:
        #         print("Resource assignment failed.")
        #         state.disaster_status = "failure"

    except requests.RequestException as e:
        print(f"❌ Error calling LLM API: {e}")

    return state
