from mailbox import Message
from xmlrpc import client
from fastapi import APIRouter, HTTPException
from models.gateway_response import GatewayRequest, GatewayResponse, GatewayRequest
import requests

router = APIRouter()


AGENT_CARD = {
    "name": "SERVER_AGENT",
    "title": "Server Agent Delegator",
    "description": "Delegates tasks to Tips Agent and Workflow Agent via A2A protocol",
    "url": "http://localhost:8000",
    "version": "1.0",
    "capabilities": {"streaming": False, "pushNotifications": False}
}


@router.get("/.well-known/agent.json")
async def get_agent_card():
    return AGENT_CARD

@router.post("/tasks/send", response_model=GatewayResponse)
async def send_task(request: GatewayRequest):
    try:
        response = None
        if request.agent == "tips":
            try:
                tips_response = requests.post("http://localhost:8002/tasks/send", json={"input": request.input})
                print("Tips agent response :", tips_response)
                response = tips_response.json()
            except requests.RequestException as e:
                print(f"Error sending task to Tips agent: {e}")
                raise HTTPException(status_code=500, detail="Failed to send task to Tips agent")
        elif request.agent == "workflow":
            try:
                workflow_response = requests.post("http://localhost:8001/tasks/send", json={"input": request.input})
                print("Workflow agent response :", workflow_response)
                response = workflow_response.json()
            except requests.RequestException as e:
                print(f"Error sending task to Workflow agent: {e}")
                raise HTTPException(status_code=500, detail="Failed to send task to Workflow agent")    
        else:
            raise HTTPException(status_code=400, detail="Unknown agent specified")

        return response

    except Exception as e:
        print(f"Error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))

