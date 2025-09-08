import json
import os
from app.models.agent_state import AgentState
from app.models.agent_state import UserMessage
import requests
from openai import OpenAI
import dotenv

dotenv.load_dotenv()
NGROK_URL = os.getenv("NGROK_URL")

def run_tips_agent(state: AgentState) -> AgentState:
    print("Tips agent is running...")

    PROMPT = f"""
    You are an expert assistant specializing in safety tips and information 
    for weather, disasters, and health issues.

    Step-by-step reasoning process:
        1. Read and understand the user's input carefully: {state.input.get('message', '') if state.input else 'Say hello to start the conversation.'}
        2. Determine the context:
            - Is the user asking for help, advice, or tips? 
            - Or is the user just making a general statement, greeting, or not asking for help?
        3. If the user is asking for help/advice:
            - Identify the specific disaster/health/weather situation.
            - Generate a maximum of 3 short, actionable, and easy-to-follow safety tips.
        4. If the user is NOT asking for help:
            - Do NOT provide tips.
            - Instead, provide only a short, natural conversational response (general info, acknowledgment, or friendly message).
        5. Ensure the tone is supportive, clear, and easy to understand (no jargon).
        6. Output only the final response in plain text inside the JSON format below.

    Final output format:
    {{
        "message": "<your supportive response or safety tips here>"
    }}
    """
    try:
        if not NGROK_URL:
            raise ValueError("NGROK_URL is not set in the .env file.")
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
                NGROK_URL + "/api/generate",
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


