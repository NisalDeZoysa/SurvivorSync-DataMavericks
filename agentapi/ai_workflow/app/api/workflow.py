from fastapi import APIRouter, HTTPException
from models.agent_state import AgentState
from models.request_status import WorkflowRequest, WorkflowResponse
from workflows.disaster_workflow import run_agent_workflow

router = APIRouter()

@router.post("/tasks/send", response_model=WorkflowResponse)
async def call_ai_workflow(request: WorkflowRequest):
    try:
        print("Received request:", request)
        initial_state = AgentState(input=request.input)
        final_state = run_agent_workflow(initial_state)
        print("Workflow completed successfully:", final_state)
        return {"state": final_state.dict()}
    except Exception as e:
        print("Error occurred:", e)
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {e}")


@router.get("/.well-known/agent.json")
def get_agent_card():
    AGENT_CARD = {
        "name": "WORKFLOW_AGENT",
        "title": "Workflow Agent",
        "description": "Handles complex workflows and task orchestration.",
        "url": "http://localhost:8001",
        "version": "2.0",
        "capabilities": {"streaming": False, "pushNotifications": False}
    }
    return AGENT_CARD
