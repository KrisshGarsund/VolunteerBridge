"""
controllers/ngo_controller.py - NGO Controller

Handles HTTP request/response for NGO-specific endpoints.
Delegates to NGOService.

Updated to accept a database instance for multi-portal support.
"""

from flask import request
from flask_jwt_extended import get_jwt_identity
from services.ngo_service import NGOService
from utils.helpers import format_response
from utils.validators import validate_required_fields


class NGOController:
    """Controller for NGO endpoints."""

    def __init__(self, db=None):
        self._service = NGOService(db=db)

    def create_request(self):
        """
        Handle POST /api/ngo/requests

        Expected JSON body:
            { title, description, skills_required (optional),
              location (optional), urgency (optional) }
        """
        try:
            data = request.get_json()
            if not data:
                return format_response(False, "Request body is required", status_code=400)

            is_valid, missing = validate_required_fields(data, ["title", "description"])
            if not is_valid:
                return format_response(
                    False, f"Missing fields: {', '.join(missing)}", status_code=400
                )

            ngo_id = get_jwt_identity()
            result = self._service.create_request(data, ngo_id)
            return format_response(True, "Help request created", result, 201)

        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def get_my_requests(self):
        """
        Handle GET /api/ngo/requests

        Returns all help requests created by the logged-in NGO.
        """
        try:
            ngo_id = get_jwt_identity()
            requests_list = self._service.get_my_requests(ngo_id)
            return format_response(True, "Requests fetched", requests_list, 200)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def view_applicants(self, request_id: str):
        """
        Handle GET /api/ngo/requests/<request_id>/applicants

        Returns volunteers who have applied to this request.
        """
        try:
            ngo_id = get_jwt_identity()
            applicants = self._service.get_applicants(request_id, ngo_id)
            return format_response(True, "Applicants fetched", applicants, 200)
        except ValueError as e:
            return format_response(False, str(e), status_code=400)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def approve_volunteer(self, request_id: str):
        """
        Handle POST /api/ngo/requests/<request_id>/approve

        Expected JSON body:
            { volunteer_id }
        """
        try:
            data = request.get_json()
            if not data or "volunteer_id" not in data:
                return format_response(False, "volunteer_id is required", status_code=400)

            ngo_id = get_jwt_identity()
            result = self._service.approve_volunteer(request_id, data["volunteer_id"], ngo_id)
            return format_response(True, "Volunteer approved and assigned", result, 200)

        except ValueError as e:
            return format_response(False, str(e), status_code=400)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def mark_completed(self, request_id: str):
        """
        Handle PUT /api/ngo/requests/<request_id>/complete

        Marks the request as completed.
        """
        try:
            ngo_id = get_jwt_identity()
            result = self._service.mark_completed(request_id, ngo_id)
            return format_response(True, "Request marked as completed", result, 200)
        except ValueError as e:
            return format_response(False, str(e), status_code=400)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def get_profile(self):
        """
        Handle GET /api/ngo/profile

        Returns the full profile of the logged-in NGO.
        """
        try:
            ngo_id = get_jwt_identity()
            profile = self._service.get_profile(ngo_id)
            return format_response(True, "Profile fetched", profile, 200)
        except ValueError as e:
            return format_response(False, str(e), status_code=404)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)
