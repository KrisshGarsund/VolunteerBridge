"""
admin_server.py - Admin Portal Flask Server

Standalone Flask application for the Admin portal.
Runs on port 5001 and connects to the admin database
(with cross-database access to volunteer and NGO databases).
"""

import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()


def create_admin_app():
    """Create and configure the Admin Flask application."""
    app = Flask(__name__)

    # ---- Configuration ---- #
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    # ---- Extensions ---- #
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ---- Database ---- #
    from db_admin import AdminDatabase
    db = AdminDatabase()

    # ---- Register Routes (with db injection) ---- #
    from routes.admin_routes import create_admin_blueprint
    from routes.auth_routes import create_auth_blueprint

    app.register_blueprint(create_auth_blueprint(db))
    app.register_blueprint(create_admin_blueprint(db))

    # ---- Health-check ---- #
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy", "service": "VolunteerBridge Admin API", "port": 5001}), 200

    # ---- Error handlers ---- #
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_admin_app()
    port = int(os.getenv("ADMIN_PORT", 5001))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    print(f"[ADMIN] Portal API running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug, use_reloader=False)
