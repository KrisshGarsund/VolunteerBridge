"""
models/ngo.py - NGO Model

Demonstrates INHERITANCE:
  - NGO inherits from User.

Demonstrates POLYMORPHISM:
  - Overrides to_dict() and from_dict() to include NGO-specific fields.
"""

from datetime import datetime, timezone
from models.user import User


class NGO(User):
    """
    Represents an NGO (Non-Governmental Organisation) user.

    Extra Attributes:
        _organization_name : Official organisation name
        _description       : Mission statement / about text
        _is_verified       : Whether an admin has verified this NGO
        _website           : Optional website URL
    """

    def __init__(self, name: str, email: str, password: str,
                 organization_name: str = "", description: str = "",
                 website: str = ""):
        """
        Initialise an NGO user.

        Args:
            name:              Contact person's name
            email:             Email address
            password:          Plain-text password
            organization_name: Name of the organisation
            description:       Mission statement
            website:           Organisation website URL
        """
        super().__init__(name, email, password, role="ngo")
        self._organization_name = organization_name
        self._description = description
        self._is_verified = False  # Must be verified by admin
        self._website = website

    # ---- Properties (Encapsulation) ---- #

    @property
    def organization_name(self):
        return self._organization_name

    @organization_name.setter
    def organization_name(self, value):
        self._organization_name = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    @property
    def is_verified(self):
        return self._is_verified

    @is_verified.setter
    def is_verified(self, value):
        self._is_verified = value

    @property
    def website(self):
        return self._website

    @website.setter
    def website(self, value):
        self._website = value

    # ---- Serialisation (Polymorphism) ---- #

    def to_dict(self) -> dict:
        """Extend parent dict with NGO-specific fields."""
        data = super().to_dict()
        data.update({
            "organization_name": self._organization_name,
            "description": self._description,
            "is_verified": self._is_verified,
            "website": self._website,
        })
        return data

    @classmethod
    def from_dict(cls, data: dict):
        """Reconstruct an NGO from a MongoDB document."""
        ngo = cls.__new__(cls)
        ngo._id = data.get("_id")
        ngo._name = data.get("name", "")
        ngo._email = data.get("email", "")
        ngo._password_hash = data.get("password_hash", "")
        ngo._role = data.get("role", "ngo")
        ngo._created_at = data.get("created_at", datetime.now(timezone.utc))
        ngo._is_active = data.get("is_active", True)
        ngo._organization_name = data.get("organization_name", "")
        ngo._description = data.get("description", "")
        ngo._is_verified = data.get("is_verified", False)
        ngo._website = data.get("website", "")
        return ngo

    def __repr__(self):
        return (f"<NGO(org={self._organization_name}, "
                f"verified={self._is_verified})>")
