import requests
from models.agent_state import AgentState
from openai import OpenAI
from models.agent_state import AllocatedResources
from db.resource_db import assign_resources, change_status_after_assign_resources


def resource_assign_agent(state: AgentState):
    print("Assigning resources...")

    PROMPT = f"""
    You are an intelligent resource assignment agent.
    Your task is to allocate the available resources from {state.available_resources} to the disaster request {state.request}.
         
    Definitions:
        - count = total resources at a center
        - used = already allocated resources
        - available = count - used
        - resourceId = resource center id

    Output format:
    {{
        "request_id": "<id>", id from state.request
        "resource_center_ids": [<list of resource center ids which can assign to this request>],
        "quantities": [<list of quantities corresponding to each resource center id>]
    }}

    Rules:
            1. Never allocate more than available (no over-allocation).
            2. Do not exhaust all resources at once (keep reserves).
            3. Consider disaster urgency when deciding quantities.
            4. Apply an optimal allocation strategy (balanced + fair).
            5. Prioritize centers by proximity and availability.
            6. Mark allocated quantities as used after assignment.
    """

    schema = {
        "type": "object",
        "properties": {
            "request_id": {"type": "integer"},
            "resource_center_ids": {
                "type": "array",
                "items": {"type": "integer"}
            },
            "quantities": {
                "type": "array",
                "items": {"type": "integer"}
            }
        },
        "required": ["request_id", "resource_center_ids", "quantities"]
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
                    "content": PROMPT,
                },
            ],
            text_format=AllocatedResources,
        )

        print(f"Status output: {res}")
        resources = res.output_parsed
        assign_complete = assign_resources(resources.request_id, resources.resource_center_ids, resources.quantities)
        if assign_complete:
            print("Resource assignment successful.")
            state.allocated_resources = resources
            response = change_status_after_assign_resources(resources.request_id, "success")
            state.disaster_status = response.get('status')
            print(f"Disaster Status change result: {response.get('status')}")
        else:
            print("Resource assignment failed.")
        # res = requests.post(
        #         "https://c6e71855f5ee.ngrok-free.app/api/generate",
        #         headers={"Content-Type": "application/json"},
        #         json={
        #             "model": "qwen3:4b",
        #             "prompt": PROMPT,
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
        # res_clear = parse_workflow_response(response_text)
        # print(f"Allocation Resource: {res_clear}")

        # # Save the allocation results to the database
        # if res_clear:
        #     response = assign_resources(res_clear.get("request_id"),res_clear.get("resource_center_ids",[]),res_clear.get("quantities",[]))
        #     if response.get("status") == "success":
        #         state.allocated_resources = res_clear
        #         print("Resource allocation successful.")
        #         print(res_clear.get("request_id"))
        #         get_status = change_status_after_assign_resources(res_clear.get("request_id"), "success")
        #         print(f"Status change result: {get_status.get('status')}")
        #         # Update the state with the new status
        #         state.disaster_status = get_status.get('status')

    except requests.RequestException as e:
        print(f"❌ Error calling LLM API: {e}")

    return state
