from models.agent_state import AgentState
import requests
from OpenAI import OpenAI


def run_tips_agent(state: AgentState) -> AgentState:
    print("Tips agent is running...")

    PROMPT = f"""
    You are an expert assistant specializing in safety tips and preparedness info 
    for weather, disasters, and health issues.

    Rules:
    - Identify disaster/general preparedness context
    - Provide actionable, concise safety/preparedness tips
    - If real-time info is needed, use the web-search MCP tool (if available)
    - Output must be plain text message only
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
        )

        print(f"Status output: {res}")
        output = res.output_parsed
        if output:
            print("TTips return successful.")
            state.user_msg = output
            
        else:
            state.error_msg = "Tips agent failed to generate a response."
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
        state.error_msg = f"Error calling LLM API: {e}"

    return state
