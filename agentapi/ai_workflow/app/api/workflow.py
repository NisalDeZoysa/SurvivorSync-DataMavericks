from fastapi import APIRouter, HTTPException
from models.agent_state import AgentState
from models.request_status import WorkflowRequest, WorkflowResponse
from workflows.disaster_workflow import run_agent_workflow

router = APIRouter()

@router.post("/ai_workflow", response_model=WorkflowResponse)
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
