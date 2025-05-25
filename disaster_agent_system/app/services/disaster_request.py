from ..agents.disaster_request_intake_agent import DisasterRequestIntakeAgent
from ..agents.task_prioritization_agent import TaskPrioritizationAgent
from ..agents.resource_tracking_agent import ResourceTrackingAgent
from ..agents.resource_assignment_agent import ResourceAssignmentAgent
from ..agents.user_communication_agent import UserCommunicationAgent
from ..agents.first_responder_communication_agent import FirstResponderCommunicationAgent

class DisasterRequestService:
    def __init__(self):
        self.intake_agent = DisasterRequestIntakeAgent()
        self.prioritization_agent = TaskPrioritizationAgent()
        self.resource_tracking_agent = ResourceTrackingAgent()
        self.resource_assignment_agent = ResourceAssignmentAgent()
        self.user_comm_agent = UserCommunicationAgent()
        self.first_responder_comm_agent = FirstResponderCommunicationAgent()

    def process_disaster_request(self, user_id, location, description):
        # Intake
        request = self.intake_agent.intake_request(user_id, location, description)

        # Prioritize
        prioritized_request = self.prioritization_agent.prioritize(request)

        # Track resources
        resources = self.resource_tracking_agent.get_available_resources(location)

        # Assign resources
        assigned_resources = self.resource_assignment_agent.assign_resources(prioritized_request, resources)

        # Communicate with user
        self.user_comm_agent.send_update(user_id, f"Your request has been prioritized with priority {prioritized_request.priority}.")

        # Notify first responders
        responder_contacts = ["army_contact", "navy_contact", "hospital_contact"]  # Replace with actual contacts
        self.first_responder_comm_agent.notify_responders(responder_contacts, f"New disaster request at {location} with priority {prioritized_request.priority}.")

        return {
            "request": prioritized_request,
            "assigned_resources": assigned_resources
        }
