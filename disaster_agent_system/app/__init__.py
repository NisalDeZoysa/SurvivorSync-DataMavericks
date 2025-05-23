from flask import Flask
from .database import init_sql_db
from .api.routes import api_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object("app.config.Config")

    # Initialize databases
    init_sql_db(app)

    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
