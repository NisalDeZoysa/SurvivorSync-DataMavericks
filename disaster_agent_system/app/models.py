from .database import db
from datetime import datetime

class DisasterRequest(db.Model):
    __tablename__ = "disaster_requests"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), nullable=False)
    location = db.Column(db.String(256), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.Integer, default=0)
    status = db.Column(db.String(32), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Resource(db.Model):
    __tablename__ = "resources"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(64), nullable=False)  # e.g., medical, food, shelter
    quantity = db.Column(db.Integer, default=0)
    location = db.Column(db.String(256), nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(64), primary_key=True)
    name = db.Column(db.String(128))
    contact_info = db.Column(db.String(256))
    role = db.Column(db.String(32))  # e.g., victim, responder
