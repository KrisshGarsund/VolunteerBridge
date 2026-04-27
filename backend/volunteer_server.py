"""
volunteer_server.py - Volunteer Portal Flask Server

Standalone Flask application for the Volunteer portal.
Runs on port 5002 and connects to the volunteer database
(with cross-database read access to NGO database for help requests).
"""

import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()


def create_volunteer_app():
    """Create and configure the Volunteer Flask application."""
    app = Flask(__name__)

    # ---- Configuration ---- #
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    # ---- Extensions ---- #
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ---- Database ---- #
    from db_volunteer import VolunteerDatabase
    db = VolunteerDatabase()

    # ---- Register Routes (with db injection) ---- #
    from routes.auth_routes import create_auth_blueprint
    from routes.volunteer_routes import create_volunteer_blueprint

    app.register_blueprint(create_auth_blueprint(db))
    app.register_blueprint(create_volunteer_blueprint(db))

    # ---- Health-check ---- #
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy", "service": "VolunteerBridge Volunteer API", "port": 5002}), 200

    # ---- Error handlers ---- #
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_volunteer_app()
    port = int(os.getenv("VOLUNTEER_PORT", 5002))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    print(f"[VOLUNTEER] Portal API running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug, use_reloader=False)
