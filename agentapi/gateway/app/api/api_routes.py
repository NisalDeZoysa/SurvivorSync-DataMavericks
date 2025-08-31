from fastapi import APIRouter, HTTPException
from models.gateway_response import GatewayResponse

router = APIRouter()

@router.post("/gateway", response_model=GatewayResponse)
async def call_gateway(request: dict):
    try:
        final_state = run_agent_workflow(request)
        return GatewayResponse(data=final_state.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow execution failed: {e}")
