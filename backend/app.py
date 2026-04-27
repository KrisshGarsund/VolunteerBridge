"""
app.py - Main Flask Application Entry Point

Sets up the Flask app using a factory-like pattern:
  1. Loads environment variables from .env
  2. Configures Flask-JWT-Extended
  3. Enables CORS for the React frontend
  4. Registers all route Blueprints
  5. Initialises the MongoDB connection
"""

import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

# Load .env before anything else
load_dotenv()


def create_app():
    """
    Application factory function.

    Returns:
        Configured Flask app instance.
    """
    app = Flask(__name__)

    # ---- Configuration ---- #
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback-secret")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    # ---- Extensions ---- #
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ---- Database (singleton is initialised on first import) ---- #
    from db import Database
    Database()

    # ---- Register Blueprints ---- #
    from routes.auth_routes import auth_bp
    from routes.volunteer_routes import volunteer_bp
    from routes.ngo_routes import ngo_bp
    from routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(volunteer_bp)
    app.register_blueprint(ngo_bp)
    app.register_blueprint(admin_bp)

    # ---- Health-check route ---- #
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "healthy", "service": "VolunteerBridge API"}), 200

    # ---- Global error handlers ---- #
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app


# ---- Entry point ---- #
if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    print(f"VolunteerBridge API running on http://localhost:{port}")
    # Using use_reloader=False to avoid WinError 10038 on Python 3.13 / Windows
    app.run(host="0.0.0.0", port=port, debug=debug, use_reloader=False)
