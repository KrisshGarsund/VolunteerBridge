"""
controllers/admin_controller.py - Admin Controller

Handles HTTP request/response for admin-specific endpoints.
Delegates to AdminService.

Updated to accept a database instance for multi-portal support.
"""

from flask import request
from services.admin_service import AdminService
from utils.helpers import format_response


class AdminController:
    """Controller for admin endpoints."""

    def __init__(self, db=None):
        self._service = AdminService(db=db)

    def verify_ngo(self, ngo_id: str):
        """
        Handle PUT /api/admin/ngo/<ngo_id>/verify

        Marks the specified NGO as verified.
        """
        try:
            result = self._service.verify_ngo(ngo_id)
            return format_response(True, "NGO verified successfully", result, 200)
        except ValueError as e:
            return format_response(False, str(e), status_code=400)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def remove_user(self, user_id: str):
        """
        Handle DELETE /api/admin/users/<user_id>

        Soft-deletes (deactivates) the specified user.
        """
        try:
            result = self._service.remove_user(user_id)
            return format_response(True, "User deactivated", result, 200)
        except ValueError as e:
            return format_response(False, str(e), status_code=400)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def get_all_users(self):
        """
        Handle GET /api/admin/users

        Returns all users on the platform.
        """
        try:
            users = self._service.get_all_users()
            return format_response(True, "Users fetched", users, 200)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def view_analytics(self):
        """
        Handle GET /api/admin/analytics

        Returns platform-wide analytics.
        """
        try:
            analytics = self._service.get_analytics()
            return format_response(True, "Analytics fetched", analytics, 200)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)
