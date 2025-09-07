import json
from models.agent_state import AgentState
from models.agent_state import UserMessage
import requests
from openai import OpenAI
import dotenv

dotenv.load_dotenv()

def run_tips_agent(state: AgentState) -> AgentState:
    print("Tips agent is running...")

    PROMPT = f"""
    You are an expert assistant specializing in safety tips and info 
    for weather, disasters, and health issues.

    Rules:
    - Identify disaster/general context
    - Provide actionable, concise safety tips
    - Output must be plain text message only and give maximum 3 tips if the user asking help only otherwise just provide general information.
    - Make the reactions like a natural conversation that means do not provide tips if the user is not asking for help or tips.

    Input:
    {state.input.get('message', '') if state.input else 'Say hello to start the conversation.'}
    Response:
    {{"message": "<tips>" }}
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
        #             "content": PROMPT,
        #         },
        #     ],
        #     text_format=TipsResponse,
        # )

        # print(f"Status output: {res.output_parsed}")
        # output = res.output_parsed.tips
        # if output:
        #     print("Tips return successful.")
        #     state.user_msg = output
            
        # else:
        #     state.error_msg = "Tips agent failed to generate a response."
        
        res = requests.post(
                "https://55713976f485.ngrok-free.app/api/generate",
                headers={"Content-Type": "application/json"},
                json={
                    "model": "qwen3:4b",
                    "prompt": PROMPT,
                    "stream": False,
                    "options": {"temperature": 0.3, "top_p": 2.0},
                    "format": UserMessage.model_json_schema(),
                },
            )
        res.raise_for_status()

        model_output = res.json()['response']
        try:
            parsed_output = json.loads(model_output)  
        except json.JSONDecodeError:
                print("⚠️ Model output is not valid JSON:", model_output)
                parsed_output = {}

        res_clear = UserMessage(**parsed_output)
        print(f"Allocation Resource: {res_clear}")

        if res_clear:
            print("Tips return successful.")
            state.user_msg = res_clear
        else:
            state.error_msg = "Tips agent failed to generate a response."

    except requests.RequestException as e:
        print(f"❌ Error calling LLM API: {e}")
        state.error_msg = f"Error calling LLM API: {e}"

    return state


