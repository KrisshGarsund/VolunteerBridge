"""
models/volunteer.py - Volunteer Model

Demonstrates INHERITANCE:
  - Volunteer inherits from User, reusing all shared auth logic.

Demonstrates POLYMORPHISM:
  - Overrides to_dict() and from_dict() to include volunteer-specific fields.
"""

from datetime import datetime, timezone
from models.user import User


class Volunteer(User):
    """
    Represents a volunteer user on the platform.

    Extra Attributes:
        _skills            : List of skill tags (e.g. ['teaching', 'cooking'])
        _accepted_requests : List of HelpRequest IDs the volunteer picked up
        _bio               : Short biography / motivation
    """

    def __init__(self, name: str, email: str, password: str,
                 skills: list = None, bio: str = ""):
        """
        Initialise a Volunteer.

        Args:
            name:     Full name
            email:    Email address
            password: Plain-text password
            skills:   List of skill tags
            bio:      Short biography
        """
        super().__init__(name, email, password, role="volunteer")
        self._skills = skills or []
        self._accepted_requests = []
        self._bio = bio

    # ---- Properties (Encapsulation) ---- #

    @property
    def skills(self):
        return self._skills

    @skills.setter
    def skills(self, value):
        self._skills = value

    @property
    def accepted_requests(self):
        return self._accepted_requests

    @accepted_requests.setter
    def accepted_requests(self, value):
        self._accepted_requests = value

    @property
    def bio(self):
        return self._bio

    @bio.setter
    def bio(self, value):
        self._bio = value

    # ---- Serialisation (Polymorphism) ---- #

    def to_dict(self) -> dict:
        """Extend parent dict with volunteer-specific fields."""
        data = super().to_dict()
        data.update({
            "skills": self._skills,
            "accepted_requests": [str(r) for r in self._accepted_requests],
            "bio": self._bio,
        })
        return data

    @classmethod
    def from_dict(cls, data: dict):
        """Reconstruct a Volunteer from a MongoDB document."""
        vol = cls.__new__(cls)
        vol._id = data.get("_id")
        vol._name = data.get("name", "")
        vol._email = data.get("email", "")
        vol._password_hash = data.get("password_hash", "")
        vol._role = data.get("role", "volunteer")
        vol._created_at = data.get("created_at", datetime.now(timezone.utc))
        vol._is_active = data.get("is_active", True)
        vol._skills = data.get("skills", [])
        vol._accepted_requests = data.get("accepted_requests", [])
        vol._bio = data.get("bio", "")
        return vol

    def __repr__(self):
        return f"<Volunteer(name={self._name}, skills={self._skills})>"
