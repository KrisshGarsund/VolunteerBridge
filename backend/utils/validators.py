"""
utils/validators.py - Input Validation Utilities

Provides reusable validation functions used by controllers
before passing data to the service layer.
"""

import re


def validate_email(email: str) -> bool:
    """Return True if the email has a valid format."""
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email))


def validate_password(password: str) -> tuple:
    """
    Validate password strength.

    Returns:
        (is_valid: bool, message: str)
    """
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    if not re.search(r"[A-Za-z]", password):
        return False, "Password must contain at least one letter"
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one digit"
    return True, "Valid"


def validate_required_fields(data: dict, required: list) -> tuple:
    """
    Check that all required keys are present and non-empty in `data`.

    Args:
        data:     The incoming request payload
        required: List of required field names

    Returns:
        (is_valid: bool, missing_fields: list)
    """
    missing = [
        field for field in required
        if field not in data or not str(data[field]).strip()
    ]
    return len(missing) == 0, missing
