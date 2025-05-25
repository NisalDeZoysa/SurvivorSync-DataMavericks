from ..models import Resource
from ..utils.sql_db_client import update_record

class ResourceAssignmentAgent:
    def assign_resources(self, disaster_request, available_resources):
        # Simple assignment logic: assign all available resources to the disaster request
        # In real case, optimize based on priority, resource type, quantity, etc.
        assigned_resources = []
        for resource in available_resources:
            if resource.quantity > 0:
                assigned_resources.append(resource)
                # Reduce resource quantity or mark assigned (logic can be extended)
                resource.quantity -= 1

        update_record()
        return assigned_resources
