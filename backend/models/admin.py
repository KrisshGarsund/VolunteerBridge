"""
models/admin.py - Admin Model

Demonstrates INHERITANCE:
  - Admin inherits from User.

Demonstrates POLYMORPHISM:
  - Overrides to_dict() and from_dict() to include admin-specific permissions.
"""

from datetime import datetime, timezone
from models.user import User


class Admin(User):
    """
    Represents an administrator of the VolunteerBridge platform.

    Extra Attributes:
        _permissions : List of permission strings (e.g. ['verify_ngo', 'remove_user'])
    """

    # Default admin permissions
    DEFAULT_PERMISSIONS = [
        "verify_ngo",
        "remove_user",
        "view_analytics",
        "manage_requests",
    ]

    def __init__(self, name: str, email: str, password: str,
                 permissions: list = None):
        """
        Initialise an Admin user.

        Args:
            name:        Full name
            email:       Email address
            password:    Plain-text password
            permissions: List of permission strings (defaults to all)
        """
        super().__init__(name, email, password, role="admin")
        self._permissions = permissions or self.DEFAULT_PERMISSIONS.copy()

    # ---- Properties (Encapsulation) ---- #

    @property
    def permissions(self):
        return self._permissions

    @permissions.setter
    def permissions(self, value):
        self._permissions = value

    def has_permission(self, permission: str) -> bool:
        """Check whether this admin has a specific permission."""
        return permission in self._permissions

    # ---- Serialisation (Polymorphism) ---- #

    def to_dict(self) -> dict:
        """Extend parent dict with admin-specific fields."""
        data = super().to_dict()
        data.update({
            "permissions": self._permissions,
        })
        return data

    @classmethod
    def from_dict(cls, data: dict):
        """Reconstruct an Admin from a MongoDB document."""
        admin = cls.__new__(cls)
        admin._id = data.get("_id")
        admin._name = data.get("name", "")
        admin._email = data.get("email", "")
        admin._password_hash = data.get("password_hash", "")
        admin._role = data.get("role", "admin")
        admin._created_at = data.get("created_at", datetime.now(timezone.utc))
        admin._is_active = data.get("is_active", True)
        admin._permissions = data.get("permissions", cls.DEFAULT_PERMISSIONS.copy())
        return admin

    def __repr__(self):
        return f"<Admin(name={self._name}, permissions={self._permissions})>"
