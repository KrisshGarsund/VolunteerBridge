"""
routes/ngo_routes.py - NGO Routes (Flask Blueprint)

Defines RESTful endpoints for NGO operations.
All routes are JWT-protected and require the 'ngo' role.

Supports both:
  - Legacy: import ngo_bp directly
  - New:    create_ngo_blueprint(db) factory
"""

from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.ngo_controller import NGOController
from middleware.role_middleware import role_required


def create_ngo_blueprint(db=None):
    """
    Factory function to create an NGO Blueprint with injected database.

    Args:
        db: Database instance to inject into the controller.

    Returns:
        Flask Blueprint with NGO routes.
    """
    bp = Blueprint("ngo", __name__, url_prefix="/api/ngo")
    controller = NGOController(db=db)

    @bp.route("/requests", methods=["POST"])
    @jwt_required()
    @role_required("ngo")
    def create_request():
        """Create a new help request."""
        return controller.create_request()

    @bp.route("/requests", methods=["GET"])
    @jwt_required()
    @role_required("ngo")
    def get_my_requests():
        """Get all requests created by this NGO."""
        return controller.get_my_requests()

    @bp.route("/requests/<request_id>/applicants", methods=["GET"])
    @jwt_required()
    @role_required("ngo")
    def view_applicants(request_id):
        """View volunteers who applied to a specific request."""
        return controller.view_applicants(request_id)

    @bp.route("/requests/<request_id>/approve", methods=["POST"])
    @jwt_required()
    @role_required("ngo")
    def approve_volunteer(request_id):
        """Approve and assign a volunteer to a request."""
        return controller.approve_volunteer(request_id)

    @bp.route("/requests/<request_id>/complete", methods=["PUT"])
    @jwt_required()
    @role_required("ngo")
    def mark_completed(request_id):
        """Mark a request as completed."""
        return controller.mark_completed(request_id)

    @bp.route("/profile", methods=["GET"])
    @jwt_required()
    @role_required("ngo")
    def get_profile():
        """Get the NGO's profile information."""
        return controller.get_profile()

    return bp


# ---- Legacy blueprint ---- #
ngo_bp = create_ngo_blueprint()
