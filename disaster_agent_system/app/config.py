import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///disaster.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    VECTOR_DB_URL = os.getenv("VECTOR_DB_URL", "http://localhost:8000")  # Example URL for vector DB
    # Add other config vars as needed
