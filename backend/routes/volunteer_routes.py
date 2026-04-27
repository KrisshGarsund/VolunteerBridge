"""
routes/volunteer_routes.py - Volunteer Routes (Flask Blueprint)

Defines RESTful endpoints for volunteer operations.
All routes are JWT-protected and require the 'volunteer' role.

Supports both:
  - Legacy: import volunteer_bp directly
  - New:    create_volunteer_blueprint(db) factory
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.volunteer_controller import VolunteerController
from middleware.role_middleware import role_required


def create_volunteer_blueprint(db=None):
    """
    Factory function to create a volunteer Blueprint with injected database.

    Args:
        db: Database instance to inject into the controller.

    Returns:
        Flask Blueprint with volunteer routes.
    """
    bp = Blueprint("volunteer", __name__, url_prefix="/api/volunteer")
    controller = VolunteerController(db=db)

    @bp.route("/requests", methods=["GET"])
    @jwt_required()
    @role_required("volunteer")
    def view_requests():
        """Get all available (open) help requests."""
        return controller.view_requests()

    @bp.route("/requests/<request_id>/accept", methods=["POST"])
    @jwt_required()
    @role_required("volunteer")
    def accept_request(request_id):
        """Apply to a specific help request."""
        return controller.accept_request(request_id)

    @bp.route("/tasks", methods=["GET"])
    @jwt_required()
    @role_required("volunteer")
    def view_tasks():
        """Get the volunteer's applied/assigned tasks."""
        return controller.view_tasks()

    @bp.route("/profile", methods=["GET"])
    @jwt_required()
    @role_required("volunteer")
    def get_profile():
        """Get the volunteer's profile information."""
        return controller.get_profile()

    return bp


# ---- Legacy blueprint ---- #
volunteer_bp = create_volunteer_blueprint()
