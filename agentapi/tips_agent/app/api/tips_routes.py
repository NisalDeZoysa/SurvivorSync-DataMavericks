from fastapi import APIRouter, HTTPException
from app.models.agent_state import AgentState
from app.models.request_status import AgentRequest, AgentResponse
from app.agents.tips_agent import run_tips_agent

router = APIRouter()

@router.post("/tasks/send", response_model=AgentResponse)
async def call_tips_agents(request: AgentRequest):
    try:
        initial_state = AgentState(input=request.input)
        final_state = run_tips_agent(initial_state)
        print("Tips agent executed successfully:", final_state)
        return {"state": final_state.dict()}
    except Exception as e:
        print("Error occurred:", e)
        raise HTTPException(status_code=500, detail=f"Tips agent execution failed: {e}")

@router.get("/.well-known/agent.json")
def get_agent_card():
    AGENT_CARD = {
        "name": "TIPS_AGENT",
        "title": "Tips and General Question Answering Person",
        "description": "Provides safety tips and advice for disaster preparedness.",
        "url": "http://localhost:8002",
        "version": "2.0",
        "capabilities": {"streaming": False, "pushNotifications": False}
    }
    return AGENT_CARD

@router.get("/health")
def health_check():
    return {"status": "ok"}