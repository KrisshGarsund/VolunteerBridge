"""
middleware/auth_middleware.py - JWT Authentication Middleware

Provides a decorator that ensures the incoming request carries a valid
JWT access token. This wraps Flask-JWT-Extended's built-in @jwt_required
with additional error formatting.
"""

from functools import wraps

from flask_jwt_extended import verify_jwt_in_request, get_jwt
from utils.helpers import format_response


def jwt_auth_required(fn):
    """
    Custom decorator that verifies JWT presence and validity.
    Returns a standardised error response on failure.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            return fn(*args, **kwargs)
        except Exception as e:
            return format_response(
                False,
                "Authentication required. Please provide a valid token.",
                status_code=401,
            )
    return wrapper
