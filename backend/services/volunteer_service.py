"""
services/volunteer_service.py - Volunteer Service (Abstraction Layer)

Business logic for volunteer-specific operations:
  - Viewing available help requests
  - Accepting a help request
  - Viewing assigned tasks

Updated to accept a database parameter (VolunteerDatabase) which
reads help requests from the NGO database.
"""

from bson import ObjectId
from utils.helpers import serialize_doc, serialize_docs


class VolunteerService:
    """Handles all volunteer-related business logic."""

    def __init__(self, db=None):
        """
        Initialise VolunteerService.

        Args:
            db: A VolunteerDatabase instance (has access to volunteer + NGO databases).
                Falls back to legacy Database singleton if not provided.
        """
        if db is not None:
            self._db = db
        else:
            from db import Database
            self._db = Database()

    def get_available_requests(self) -> list:
        """
        Fetch all help requests with status 'open'.

        Returns:
            List of serialised request documents.
        """
        requests = self._db.help_requests.find({"status": "open"})
        return serialize_docs(requests)

    def accept_request(self, request_id: str, volunteer_id: str) -> dict:
        """
        Apply to a help request as a volunteer.

        Args:
            request_id:   ID of the help request
            volunteer_id: ID of the volunteer

        Returns:
            Updated request document

        Raises:
            ValueError: if request not found, already applied, or not open
        """
        oid = ObjectId(request_id)
        request_doc = self._db.help_requests.find_one({"_id": oid})

        if not request_doc:
            raise ValueError("Help request not found")

        if request_doc["status"] != "open":
            raise ValueError("This request is no longer accepting applicants")

        # Prevent duplicate applications
        if volunteer_id in request_doc.get("applicants", []):
            raise ValueError("You have already applied to this request")

        self._db.help_requests.update_one(
            {"_id": oid},
            {"$push": {"applicants": volunteer_id}},
        )

        # Also track on the volunteer's document
        self._db.users.update_one(
            {"_id": ObjectId(volunteer_id)},
            {"$push": {"accepted_requests": request_id}},
        )

        updated = self._db.help_requests.find_one({"_id": oid})
        return serialize_doc(updated)

    def get_my_tasks(self, volunteer_id: str) -> list:
        """
        Fetch help requests where this volunteer is either an applicant
        or the assigned volunteer.

        Args:
            volunteer_id: ID of the volunteer

        Returns:
            List of serialised request documents
        """
        requests = self._db.help_requests.find({
            "$or": [
                {"applicants": volunteer_id},
                {"assigned_volunteer": volunteer_id},
            ]
        })
        return serialize_docs(requests)

    def get_profile(self, volunteer_id: str) -> dict:
        """
        Fetch the full profile of a volunteer.

        Args:
            volunteer_id: ID of the volunteer

        Returns:
            Safe user document (no password hash)

        Raises:
            ValueError: if user not found
        """
        user_doc = self._db.users.find_one({"_id": ObjectId(volunteer_id)})
        if not user_doc:
            raise ValueError("Volunteer not found")

        return {
            "_id": str(user_doc["_id"]),
            "name": user_doc.get("name", ""),
            "email": user_doc.get("email", ""),
            "role": user_doc.get("role", "volunteer"),
            "skills": user_doc.get("skills", []),
            "bio": user_doc.get("bio", ""),
            "created_at": str(user_doc.get("created_at", "")),
            "is_active": user_doc.get("is_active", True),
            "accepted_requests": user_doc.get("accepted_requests", []),
        }
