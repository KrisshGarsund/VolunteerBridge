"""
controllers/auth_controller.py - Authentication Controller

Handles HTTP request parsing and response formatting for auth endpoints.
Delegates business logic to AuthService (separation of concerns).

Updated to accept a database instance for multi-portal support.
"""

from flask import request
from services.auth_service import AuthService
from utils.helpers import format_response
from utils.validators import validate_email, validate_password, validate_required_fields


class AuthController:
    """Controller for authentication endpoints."""

    def __init__(self, db=None):
        self._service = AuthService(db=db)

    def register_volunteer(self):
        """
        Handle POST /api/auth/register/volunteer

        Expected JSON body:
            { name, email, password, skills (optional), bio (optional) }
        """
        try:
            data = request.get_json()
            if not data:
                return format_response(False, "Request body is required", status_code=400)

            # Validate required fields
            is_valid, missing = validate_required_fields(data, ["name", "email", "password"])
            if not is_valid:
                return format_response(
                    False, f"Missing fields: {', '.join(missing)}", status_code=400
                )

            # Validate email format
            if not validate_email(data["email"]):
                return format_response(False, "Invalid email format", status_code=400)

            # Validate password strength
            pw_valid, pw_msg = validate_password(data["password"])
            if not pw_valid:
                return format_response(False, pw_msg, status_code=400)

            user = self._service.register_volunteer(data)
            return format_response(True, "Volunteer registered successfully", user, 201)

        except ValueError as e:
            return format_response(False, str(e), status_code=409)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def register_ngo(self):
        """
        Handle POST /api/auth/register/ngo

        Expected JSON body:
            { name, email, password, organization_name, description (optional), website (optional) }
        """
        try:
            data = request.get_json()
            if not data:
                return format_response(False, "Request body is required", status_code=400)

            is_valid, missing = validate_required_fields(
                data, ["name", "email", "password", "organization_name"]
            )
            if not is_valid:
                return format_response(
                    False, f"Missing fields: {', '.join(missing)}", status_code=400
                )

            if not validate_email(data["email"]):
                return format_response(False, "Invalid email format", status_code=400)

            pw_valid, pw_msg = validate_password(data["password"])
            if not pw_valid:
                return format_response(False, pw_msg, status_code=400)

            user = self._service.register_ngo(data)
            return format_response(True, "NGO registered successfully", user, 201)

        except ValueError as e:
            return format_response(False, str(e), status_code=409)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)

    def login(self):
        """
        Handle POST /api/auth/login

        Expected JSON body:
            { email, password }
        """
        try:
            data = request.get_json()
            if not data:
                return format_response(False, "Request body is required", status_code=400)

            is_valid, missing = validate_required_fields(data, ["email", "password"])
            if not is_valid:
                return format_response(
                    False, f"Missing fields: {', '.join(missing)}", status_code=400
                )

            result = self._service.login(data["email"], data["password"])
            return format_response(True, "Login successful", result, 200)

        except ValueError as e:
            return format_response(False, str(e), status_code=401)
        except Exception as e:
            return format_response(False, f"Server error: {str(e)}", status_code=500)
