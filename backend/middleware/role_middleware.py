"""
middleware/role_middleware.py - Role-Based Access Control Middleware

Provides a decorator that checks whether the authenticated user's JWT
contains the required role claim. This enables role-based protection
on endpoints (e.g. only 'admin' can access admin routes).
"""

from functools import wraps

from flask_jwt_extended import get_jwt
from utils.helpers import format_response


def role_required(*allowed_roles):
    """
    Decorator factory that restricts access to users whose JWT 'role'
    claim matches one of the allowed roles.

    Usage:
        @jwt_required()
        @role_required("admin")
        def admin_only_view():
            ...

        @jwt_required()
        @role_required("ngo", "admin")
        def ngo_or_admin_view():
            ...
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get("role", "")

            if user_role not in allowed_roles:
                return format_response(
                    False,
                    f"Access denied. Required role(s): {', '.join(allowed_roles)}",
                    status_code=403,
                )

            return fn(*args, **kwargs)
        return wrapper
    return decorator
