from ..models import Resource
from ..utils.sql_db_client import db

class ResourceTrackingAgent:
    def get_available_resources(self, location):
        # Query resources in the affected location
        resources = Resource.query.filter(Resource.location == location).all()
        return resources

    def update_resource(self, resource_id, quantity):
        resource = Resource.query.get(resource_id)
        if resource:
            resource.quantity = quantity
            db.session.commit()
        return resource
