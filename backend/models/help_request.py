"""
models/help_request.py - HelpRequest Model

Demonstrates ENCAPSULATION:
  - All fields are private, accessed via @property.

Represents a help/volunteer request created by an NGO.
"""

from datetime import datetime, timezone


class HelpRequest:
    """
    Represents a help request posted by an NGO.

    Lifecycle:  open → in_progress → completed
                open → cancelled

    Attributes (encapsulated):
        _id                  : MongoDB ObjectId
        _title               : Short title of the request
        _description         : Detailed description of what help is needed
        _ngo_id              : ObjectId of the NGO that created this request
        _skills_required     : List of skill tags needed
        _status              : 'open' | 'in_progress' | 'completed' | 'cancelled'
        _applicants          : List of volunteer user IDs who applied
        _assigned_volunteer  : ID of the volunteer assigned (after approval)
        _created_at          : Timestamp
        _location            : Location string
        _urgency             : 'low' | 'medium' | 'high'
    """

    VALID_STATUSES = ["open", "in_progress", "completed", "cancelled"]
    VALID_URGENCIES = ["low", "medium", "high"]

    def __init__(self, title: str, description: str, ngo_id: str,
                 skills_required: list = None, location: str = "",
                 urgency: str = "medium"):
        self._id = None
        self._title = title
        self._description = description
        self._ngo_id = ngo_id
        self._skills_required = skills_required or []
        self._status = "open"
        self._applicants = []
        self._assigned_volunteer = None
        self._created_at = datetime.now(timezone.utc)
        self._location = location
        self._urgency = urgency if urgency in self.VALID_URGENCIES else "medium"

    # ---- Properties (Encapsulation) ---- #

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @property
    def title(self):
        return self._title

    @title.setter
    def title(self, value):
        self._title = value

    @property
    def description(self):
        return self._description

    @description.setter
    def description(self, value):
        self._description = value

    @property
    def ngo_id(self):
        return self._ngo_id

    @property
    def skills_required(self):
        return self._skills_required

    @skills_required.setter
    def skills_required(self, value):
        self._skills_required = value

    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        if value in self.VALID_STATUSES:
            self._status = value
        else:
            raise ValueError(f"Invalid status: {value}")

    @property
    def applicants(self):
        return self._applicants

    @applicants.setter
    def applicants(self, value):
        self._applicants = value

    @property
    def assigned_volunteer(self):
        return self._assigned_volunteer

    @assigned_volunteer.setter
    def assigned_volunteer(self, value):
        self._assigned_volunteer = value

    @property
    def created_at(self):
        return self._created_at

    @created_at.setter
    def created_at(self, value):
        self._created_at = value

    @property
    def location(self):
        return self._location

    @property
    def urgency(self):
        return self._urgency

    # ---- Serialisation ---- #

    def to_dict(self) -> dict:
        """Convert to a MongoDB-ready dictionary."""
        return {
            "title": self._title,
            "description": self._description,
            "ngo_id": str(self._ngo_id),
            "skills_required": self._skills_required,
            "status": self._status,
            "applicants": [str(a) for a in self._applicants],
            "assigned_volunteer": str(self._assigned_volunteer) if self._assigned_volunteer else None,
            "created_at": self._created_at,
            "location": self._location,
            "urgency": self._urgency,
        }

    def to_safe_dict(self) -> dict:
        """Return a serialisable dict for API responses."""
        data = self.to_dict()
        if self._id:
            data["_id"] = str(self._id)
        return data

    @classmethod
    def from_dict(cls, data: dict):
        """Reconstruct a HelpRequest from a MongoDB document."""
        req = cls.__new__(cls)
        req._id = data.get("_id")
        req._title = data.get("title", "")
        req._description = data.get("description", "")
        req._ngo_id = data.get("ngo_id", "")
        req._skills_required = data.get("skills_required", [])
        req._status = data.get("status", "open")
        req._applicants = data.get("applicants", [])
        req._assigned_volunteer = data.get("assigned_volunteer")
        req._created_at = data.get("created_at", datetime.now(timezone.utc))
        req._location = data.get("location", "")
        req._urgency = data.get("urgency", "medium")
        return req

    def __repr__(self):
        return f"<HelpRequest(title={self._title}, status={self._status})>"
