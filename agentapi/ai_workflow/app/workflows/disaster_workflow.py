from langgraph.graph import StateGraph, END
from app.models.agent_state import AgentState
from app.agents.request_intake import request_intake_agent
from app.agents.media_extraction import media_extraction_agent
from app.agents.verify_request import request_verify_agent, check_verification
from app.agents.resource_tracking import resource_tracking_agent
from app.agents.resource_assign import resource_assign_agent
from app.agents.user_communication import user_communication_agent

def create_workflow():
    workflow = StateGraph(AgentState)
    workflow.add_node("request_intake", request_intake_agent)
    workflow.add_node("media_extraction", media_extraction_agent)  
    workflow.add_node("verify_request", request_verify_agent)
    workflow.add_node("track_resources", resource_tracking_agent)
    workflow.add_node("assign_resources", resource_assign_agent)
    workflow.add_node("communicate_with_user", user_communication_agent)

    workflow.set_entry_point("request_intake")
    workflow.add_edge("request_intake", "media_extraction")
    workflow.add_edge("media_extraction", "verify_request")
    workflow.add_conditional_edges("verify_request", check_verification, {
        "NoExecute": END,
        "Execute": "track_resources"
    })
    workflow.add_edge("track_resources", "assign_resources")
    workflow.add_edge("assign_resources", "communicate_with_user")
    workflow.add_edge("communicate_with_user", END)
    
    return workflow.compile()

def run_agent_workflow(initial_state: AgentState) -> AgentState:
    try:
        agent_workflow = create_workflow()
        config = {"recursion_limit": 100} 
        agent_state = agent_workflow.invoke(initial_state, config=config)
        print("Final agent state:", agent_state)
        if isinstance(agent_state, dict):
            agent_state = AgentState(**agent_state)
        return agent_state
    except Exception as e:
        print("Error occurred while running agent workflow:", e)
        print("Final agent state:", AgentState(error_msg=str(e)))
        return AgentState(error_msg=str(e))
