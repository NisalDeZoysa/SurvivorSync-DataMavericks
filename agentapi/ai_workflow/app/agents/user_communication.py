import requests
from models.agent_state import AgentState, UserMessage
from openai import OpenAI


def user_communication_agent(state: AgentState):
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
    
    schema = {
        "type": "object",
        "properties": {
            "message": {"type": "string"}
        },
        "required": ["message"]
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
            text_format=UserMessage,
        )
        
        parsed: UserMessage = res.output_parsed
        state.user_msg = parsed
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
        # res_clear = re.sub(r'<think>.*?</think>', '', response_text, flags=re.DOTALL).strip()
        # print(f"User MSG: {res_clear}")

        # state.user_msg = res_clear

    except requests.RequestException as e:
        print(f"❌ Error calling LLM API: {e}")

    return state
