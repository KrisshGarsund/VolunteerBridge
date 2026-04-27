"""
routes/admin_routes.py - Admin Routes (Flask Blueprint)

Defines RESTful endpoints for admin operations.
All routes are JWT-protected and require the 'admin' role.

Supports both:
  - Legacy: import admin_bp directly
  - New:    create_admin_blueprint(db) factory
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.admin_controller import AdminController
from middleware.role_middleware import role_required


def create_admin_blueprint(db=None):
    """
    Factory function to create an admin Blueprint with injected database.

    Args:
        db: Database instance to inject into the controller.

    Returns:
        Flask Blueprint with admin routes.
    """
    bp = Blueprint("admin", __name__, url_prefix="/api/admin")
    controller = AdminController(db=db)

    @bp.route("/ngo/<ngo_id>/verify", methods=["PUT"])
    @jwt_required()
    @role_required("admin")
    def verify_ngo(ngo_id):
        """Verify an NGO account."""
        return controller.verify_ngo(ngo_id)

    @bp.route("/users/<user_id>", methods=["DELETE"])
    @jwt_required()
    @role_required("admin")
    def remove_user(user_id):
        """Deactivate a user account."""
        return controller.remove_user(user_id)

    @bp.route("/users", methods=["GET"])
    @jwt_required()
    @role_required("admin")
    def get_all_users():
        """Get all users on the platform."""
        return controller.get_all_users()

    @bp.route("/analytics", methods=["GET"])
    @jwt_required()
    @role_required("admin")
    def view_analytics():
        """Get platform analytics."""
        return controller.view_analytics()

    return bp


# ---- Legacy blueprint ---- #
admin_bp = create_admin_blueprint()
