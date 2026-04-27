"""
models/user.py - Abstract Base User Model

Demonstrates ENCAPSULATION:
  - All fields are private (prefixed with _)
  - Accessed only through @property getters and setters

Demonstrates ABSTRACTION:
  - Serves as the base class that Volunteer, NGO, and Admin inherit from.
  - Contains shared logic: password hashing, dict serialisation, etc.
"""

from datetime import datetime, timezone
import bcrypt


class User:
    """
    Abstract base class for all user types in VolunteerBridge.

    Attributes (encapsulated):
        _id          : MongoDB ObjectId (set after DB insert)
        _name        : Full name of the user
        _email       : Unique email address
        _password_hash: bcrypt-hashed password
        _role        : One of 'volunteer', 'ngo', 'admin'
        _created_at  : Account creation timestamp
        _is_active   : Whether the account is active
    """

    def __init__(self, name: str, email: str, password: str, role: str):
        """
        Initialise a new User instance.

        Args:
            name:     Full name
            email:    Email address
            password: Plain-text password (will be hashed immediately)
            role:     Role identifier ('volunteer' | 'ngo' | 'admin')
        """
        self._id = None
        self._name = name
        self._email = email.lower().strip()
        self._password_hash = self._hash_password(password)
        self._role = role
        self._created_at = datetime.now(timezone.utc)
        self._is_active = True

    # ------------------------------------------------------------------ #
    #  Password utilities                                                  #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash a plain-text password using bcrypt."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def check_password(self, password: str) -> bool:
        """Verify a plain-text password against the stored hash."""
        return bcrypt.checkpw(
            password.encode("utf-8"),
            self._password_hash.encode("utf-8"),
        )

    # ------------------------------------------------------------------ #
    #  Properties (Encapsulation)                                          #
    # ------------------------------------------------------------------ #

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, value):
        self._name = value

    @property
    def email(self):
        return self._email

    @property
    def password_hash(self):
        return self._password_hash

    @password_hash.setter
    def password_hash(self, value):
        self._password_hash = value

    @property
    def role(self):
        return self._role

    @property
    def created_at(self):
        return self._created_at

    @created_at.setter
    def created_at(self, value):
        self._created_at = value

    @property
    def is_active(self):
        return self._is_active

    @is_active.setter
    def is_active(self, value):
        self._is_active = value

    # ------------------------------------------------------------------ #
    #  Serialisation (Polymorphism – subclasses override this)             #
    # ------------------------------------------------------------------ #

    def to_dict(self) -> dict:
        """
        Convert the user to a dictionary suitable for MongoDB insertion.
        Subclasses override this to add their own fields (polymorphism).
        """
        return {
            "name": self._name,
            "email": self._email,
            "password_hash": self._password_hash,
            "role": self._role,
            "created_at": self._created_at,
            "is_active": self._is_active,
        }

    def to_safe_dict(self) -> dict:
        """Return a dictionary *without* the password hash (safe for API responses)."""
        data = self.to_dict()
        data.pop("password_hash", None)
        if self._id:
            data["_id"] = str(self._id)
        return data

    # ------------------------------------------------------------------ #
    #  Factory (class method)                                              #
    # ------------------------------------------------------------------ #

    @classmethod
    def from_dict(cls, data: dict):
        """
        Reconstruct a User instance from a MongoDB document.
        Subclasses should override this for their extra fields.
        """
        user = cls.__new__(cls)
        user._id = data.get("_id")
        user._name = data.get("name", "")
        user._email = data.get("email", "")
        user._password_hash = data.get("password_hash", "")
        user._role = data.get("role", "")
        user._created_at = data.get("created_at", datetime.now(timezone.utc))
        user._is_active = data.get("is_active", True)
        return user

    def __repr__(self):
        return f"<User(name={self._name}, email={self._email}, role={self._role})>"
