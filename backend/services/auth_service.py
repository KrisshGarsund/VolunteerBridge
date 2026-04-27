"""
services/auth_service.py - Authentication Service (Abstraction Layer)

Encapsulates all authentication logic:
  - Volunteer registration
  - NGO registration
  - Admin login
  - Login (role-agnostic)

The controllers call this service instead of interacting with the
database or models directly — demonstrating ABSTRACTION.

Updated to accept a database parameter so each portal server
can inject its own database connection.
"""

from flask_jwt_extended import create_access_token
from bson import ObjectId
from models.volunteer import Volunteer
from models.ngo import NGO
from models.admin import Admin
from utils.helpers import serialize_doc


class AuthService:
    """Handles all authentication-related business logic."""

    def __init__(self, db=None):
        """
        Initialise AuthService with a database instance.

        Args:
            db: A database singleton instance (AdminDatabase, VolunteerDatabase, or NGODatabase).
                Falls back to the legacy Database singleton if not provided.
        """
        if db is not None:
            self._db = db
        else:
            from db import Database
            self._db = Database()

    # ------------------------------------------------------------------ #
    #  Registration                                                        #
    # ------------------------------------------------------------------ #

    def register_volunteer(self, data: dict) -> dict:
        """
        Register a new volunteer.

        Args:
            data: dict with keys name, email, password, skills (optional), bio (optional)

        Returns:
            dict with created user info

        Raises:
            ValueError: if email already exists
        """
        # Check for duplicate email
        if self._db.users.find_one({"email": data["email"].lower().strip()}):
            raise ValueError("Email already registered")

        volunteer = Volunteer(
            name=data["name"],
            email=data["email"],
            password=data["password"],
            skills=data.get("skills", []),
            bio=data.get("bio", ""),
        )

        result = self._db.users.insert_one(volunteer.to_dict())
        volunteer.id = result.inserted_id

        return volunteer.to_safe_dict()

    def register_ngo(self, data: dict) -> dict:
        """
        Register a new NGO.

        Args:
            data: dict with keys name, email, password, organization_name,
                  description (optional), website (optional)

        Returns:
            dict with created NGO info

        Raises:
            ValueError: if email already exists
        """
        if self._db.users.find_one({"email": data["email"].lower().strip()}):
            raise ValueError("Email already registered")

        ngo = NGO(
            name=data["name"],
            email=data["email"],
            password=data["password"],
            organization_name=data.get("organization_name", ""),
            description=data.get("description", ""),
            website=data.get("website", ""),
        )

        result = self._db.users.insert_one(ngo.to_dict())
        ngo.id = result.inserted_id

        return ngo.to_safe_dict()

    # ------------------------------------------------------------------ #
    #  Login                                                               #
    # ------------------------------------------------------------------ #

    def login(self, email: str, password: str) -> dict:
        """
        Authenticate a user and return a JWT access token.

        Args:
            email:    User's email
            password: Plain-text password

        Returns:
            dict containing access_token and user info

        Raises:
            ValueError: if credentials are invalid
        """
        user_doc = self._db.users.find_one({"email": email.lower().strip()})
        if not user_doc:
            raise ValueError("Invalid email or password")

        # Reconstruct the correct model subclass based on role
        role = user_doc.get("role", "")
        user_obj = self._reconstruct_user(user_doc, role)

        if not user_obj.check_password(password):
            raise ValueError("Invalid email or password")

        if not user_obj.is_active:
            raise ValueError("Account has been deactivated")

        # Create JWT with identity = user ID, and extra claims for role
        access_token = create_access_token(
            identity=str(user_doc["_id"]),
            additional_claims={"role": role, "email": user_obj.email},
        )

        # Build user info with role-specific fields
        user_info = {
            "_id": user_doc["_id"],
            "name": user_obj.name,
            "email": user_obj.email,
            "role": role,
        }

        # Include role-specific data so the frontend can display profile info
        if role == "volunteer":
            user_info["skills"] = user_doc.get("skills", [])
            user_info["bio"] = user_doc.get("bio", "")
        elif role == "ngo":
            user_info["organization_name"] = user_doc.get("organization_name", "")
            user_info["description"] = user_doc.get("description", "")
            user_info["website"] = user_doc.get("website", "")
            user_info["is_verified"] = user_doc.get("is_verified", False)

        return {
            "access_token": access_token,
            "user": serialize_doc(user_info),
        }

    # ------------------------------------------------------------------ #
    #  Internal helpers                                                    #
    # ------------------------------------------------------------------ #

    @staticmethod
    def _reconstruct_user(doc: dict, role: str):
        """
        Reconstruct the appropriate User subclass from a MongoDB document.
        Demonstrates POLYMORPHISM — the correct subclass is chosen at runtime.
        """
        if role == "volunteer":
            return Volunteer.from_dict(doc)
        elif role == "ngo":
            return NGO.from_dict(doc)
        elif role == "admin":
            return Admin.from_dict(doc)
        else:
            from models.user import User
            return User.from_dict(doc)
