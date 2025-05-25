from ..database import db

def add_record(record):
    db.session.add(record)
    db.session.commit()

def get_disaster_request_by_id(request_id):
    from ..models import DisasterRequest
    return DisasterRequest.query.get(request_id)

def update_record():
    db.session.commit()
