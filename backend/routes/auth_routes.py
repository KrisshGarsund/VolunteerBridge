"""
routes/auth_routes.py - Authentication Routes (Flask Blueprint)

Defines RESTful endpoints for user registration and login.
No JWT protection — these are public endpoints.

Supports both:
  - Legacy: import auth_bp directly (uses global Database)
  - New:    create_auth_blueprint(db) factory (uses injected database)
"""

from flask import Blueprint
from controllers.auth_controller import AuthController


def create_auth_blueprint(db=None):
    """
    Factory function to create an auth Blueprint with injected database.

    Args:
        db: Database instance to inject into the controller.

    Returns:
        Flask Blueprint with auth routes.
    """
    bp = Blueprint("auth", __name__, url_prefix="/api/auth")
    controller = AuthController(db=db)

    @bp.route("/register/volunteer", methods=["POST"])
    def register_volunteer():
        """Register a new volunteer account."""
        return controller.register_volunteer()

    @bp.route("/register/ngo", methods=["POST"])
    def register_ngo():
        """Register a new NGO account."""
        return controller.register_ngo()

    @bp.route("/login", methods=["POST"])
    def login():
        """Authenticate a user and return a JWT token."""
        return controller.login()

    return bp


# ---- Legacy blueprint (backwards compatibility with app.py) ---- #
auth_bp = create_auth_blueprint()
