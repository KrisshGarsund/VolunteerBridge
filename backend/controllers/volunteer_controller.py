"""
controllers/volunteer_controller.py - Volunteer Controller

Handles HTTP request/response for volunteer-specific endpoints.
Delegates to VolunteerService.

Updated to accept a database instance for multi-portal support.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity
from services.volunteer_service import VolunteerService
from utils.helpers import format_response


class VolunteerController:
    """Controller for volunteer endpoints."""

    def __init__(self, db=None):
        self._service = VolunteerService(db=db)

    def view_requests(self):
        """
        Handle GET /api/volunteer/requests

        Returns all open help requests.
        """
        try:
            requests_list = self._service.get_available_requests()
            return format_response(True, "Requests fetched", requests_list, 200)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def accept_request(self, request_id: str):
        """
        Handle POST /api/volunteer/requests/<request_id>/accept

        The volunteer ID is extracted from the JWT token.
        """
        try:
            volunteer_id = get_jwt_identity()
            result = self._service.accept_request(request_id, volunteer_id)
            return format_response(True, "Applied to request successfully", result, 200)
        except ValueError as e:
            return format_response(False, str(e), status_code=400)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def view_tasks(self):
        """
        Handle GET /api/volunteer/tasks

        Returns requests the logged-in volunteer has applied to or been assigned.
        """
        try:
            volunteer_id = get_jwt_identity()
            tasks = self._service.get_my_tasks(volunteer_id)
            return format_response(True, "Tasks fetched", tasks, 200)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def get_profile(self):
        """
        Handle GET /api/volunteer/profile

        Returns the full profile of the logged-in volunteer.
        """
        try:
            volunteer_id = get_jwt_identity()
            profile = self._service.get_profile(volunteer_id)
            return format_response(True, "Profile fetched", profile, 200)
        except ValueError as e:
            return format_response(False, str(e), status_code=404)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)
