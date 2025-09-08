import json
import os
import requests
from app.models.agent_state import AgentState, UserMessage
from openai import OpenAI
import dotenv

dotenv.load_dotenv()
NGROK_URL = os.getenv("NGROK_URL")
def user_communication_agent(state: AgentState):
    
    if not NGROK_URL:
        raise ValueError("NGROK_URL is not set in the .env file.")
    print("Communicating with user...")

    PROMPT = f"""
        You are an intelligent user communication agent. 
        Your task is to create a short and clear message that can be sent to the user about their disaster request.

        Information you have:
        - Request details: {state.request}
        - Verification status: {state.status}
        - Allocated resources: {state.allocated_resources}
        - Disaster severity/status: {state.disaster_status}

        Rules for generating the message:
        1. Always include a kind and motivating/encouraging sentence at the start (to keep the user hopeful and calm).
        2. If the request is VERIFIED → acknowledge and confirm to the user.
        If the request is NOT VERIFIED → politely explain that it cannot be verified right now, and mention that an agent will connect with them soon. 
        Encourage the user to re-send the request if the situation worsens.
        3. If resources are allocated → confirm to the user that help/resources are on the way.
        If no resources are allocated → explain that currently resources are limited, but reassure them that help will reach soon.
        4. Mention the disaster severity/status clearly so the user knows how serious the situation is.
        5. The message should be short, simple, and easy to understand by anyone (avoid technical jargon).

        Now, based on the above rules and given information, write one clear and supportive message for the user.
        output format:
        {{
            "message": "Your supportive message goes here."
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
        #             "content": PROMPT,
        #         },
        #     ],
        #     text_format=UserMessage,
        # )
        
        # parsed: UserMessage = res.output_parsed
        # state.user_msg = parsed
        
        res = requests.post(
                NGROK_URL + "/api/generate",
                headers={"Content-Type": "application/json"},
                json={
                    "model": "qwen3:4b",
                    "prompt": PROMPT,
                    "stream": False,
                    "options": {"temperature": 0.2},
                    "format": UserMessage.model_json_schema(),
                },
            )
        res.raise_for_status()
        
        raw_text = res.json()['response']
        try:
            json_output = json.loads(raw_text)
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON in response: {raw_text}")

        res_clear = UserMessage(**json_output)

        print(f"User Message: {res_clear}")

        state.user_msg = res_clear

    except requests.RequestException as e:
        print(f"❌ Error calling LLM API: {e}")

    return state
