"""
services/ngo_service.py - NGO Service (Abstraction Layer)

Business logic for NGO-specific operations:
  - Creating help requests
  - Viewing applicants
  - Approving a volunteer
  - Marking a request as completed

Updated to accept a database parameter (NGODatabase) which
reads volunteer data from the volunteer database.
"""

from bson import ObjectId
from models.help_request import HelpRequest
from utils.helpers import serialize_doc, serialize_docs


class NGOService:
    """Handles all NGO-related business logic."""

    def __init__(self, db=None):
        """
        Initialise NGOService.

        Args:
            db: An NGODatabase instance (has access to NGO + volunteer databases).
                Falls back to legacy Database singleton if not provided.
        """
        if db is not None:
            self._db = db
        else:
            from db import Database
            self._db = Database()

    def create_request(self, data: dict, ngo_id: str) -> dict:
        """
        Create a new help request.

        Args:
            data:   dict with title, description, skills_required, location, urgency
            ngo_id: ID of the requesting NGO

        Returns:
            Serialised request document
        """
        help_request = HelpRequest(
            title=data["title"],
            description=data["description"],
            ngo_id=ngo_id,
            skills_required=data.get("skills_required", []),
            location=data.get("location", ""),
            urgency=data.get("urgency", "medium"),
        )

        result = self._db.help_requests.insert_one(help_request.to_dict())
        help_request.id = result.inserted_id

        return help_request.to_safe_dict()

    def get_my_requests(self, ngo_id: str) -> list:
        """Fetch all help requests created by this NGO."""
        requests = self._db.help_requests.find({"ngo_id": ngo_id})
        return serialize_docs(requests)

    def get_applicants(self, request_id: str, ngo_id: str) -> list:
        """
        Get the list of volunteer applicants for a specific request.

        Args:
            request_id: ID of the help request
            ngo_id:     ID of the NGO (for ownership verification)

        Returns:
            List of volunteer user documents

        Raises:
            ValueError: if request not found or NGO doesn't own it
        """
        request_doc = self._db.help_requests.find_one({"_id": ObjectId(request_id)})

        if not request_doc:
            raise ValueError("Help request not found")
        if request_doc["ngo_id"] != ngo_id:
            raise ValueError("You do not own this request")

        # Fetch volunteer details — from volunteer database if available
        volunteer_collection = getattr(self._db, 'volunteer_users', self._db.users)
        applicant_ids = [ObjectId(aid) for aid in request_doc.get("applicants", [])]
        volunteers = volunteer_collection.find({
            "_id": {"$in": applicant_ids},
            "role": "volunteer",
        })

        result = []
        for vol in volunteers:
            result.append({
                "_id": str(vol["_id"]),
                "name": vol.get("name", ""),
                "email": vol.get("email", ""),
                "skills": vol.get("skills", []),
                "bio": vol.get("bio", ""),
            })
        return result

    def approve_volunteer(self, request_id: str, volunteer_id: str, ngo_id: str) -> dict:
        """
        Approve and assign a volunteer to a help request.

        Args:
            request_id:   ID of the help request
            volunteer_id: ID of the volunteer to assign
            ngo_id:       ID of the NGO (ownership check)

        Returns:
            Updated request document

        Raises:
            ValueError: if request not found, ownership mismatch, or volunteer not in applicants
        """
        oid = ObjectId(request_id)
        request_doc = self._db.help_requests.find_one({"_id": oid})

        if not request_doc:
            raise ValueError("Help request not found")
        if request_doc["ngo_id"] != ngo_id:
            raise ValueError("You do not own this request")
        if volunteer_id not in request_doc.get("applicants", []):
            raise ValueError("This volunteer has not applied to this request")

        self._db.help_requests.update_one(
            {"_id": oid},
            {
                "$set": {
                    "assigned_volunteer": volunteer_id,
                    "status": "in_progress",
                }
            },
        )

        updated = self._db.help_requests.find_one({"_id": oid})
        return serialize_doc(updated)

    def mark_completed(self, request_id: str, ngo_id: str) -> dict:
        """
        Mark a help request as completed.

        Args:
            request_id: ID of the help request
            ngo_id:     ID of the NGO (ownership check)

        Returns:
            Updated request document

        Raises:
            ValueError: if request not found, ownership mismatch, or not in_progress
        """
        oid = ObjectId(request_id)
        request_doc = self._db.help_requests.find_one({"_id": oid})

        if not request_doc:
            raise ValueError("Help request not found")
        if request_doc["ngo_id"] != ngo_id:
            raise ValueError("You do not own this request")
        if request_doc["status"] not in ["in_progress", "open"]:
            raise ValueError("Only open or in-progress requests can be finished")

        self._db.help_requests.update_one(
            {"_id": oid},
            {"$set": {"status": "completed"}},
        )

        updated = self._db.help_requests.find_one({"_id": oid})
        return serialize_doc(updated)

    def get_profile(self, ngo_id: str) -> dict:
        """
        Fetch the full profile of an NGO.

        Args:
            ngo_id: ID of the NGO

        Returns:
            Safe user document (no password hash)

        Raises:
            ValueError: if user not found
        """
        user_doc = self._db.users.find_one({"_id": ObjectId(ngo_id)})
        if not user_doc:
            raise ValueError("NGO not found")

        return {
            "_id": str(user_doc["_id"]),
            "name": user_doc.get("name", ""),
            "email": user_doc.get("email", ""),
            "role": user_doc.get("role", "ngo"),
            "organization_name": user_doc.get("organization_name", ""),
            "description": user_doc.get("description", ""),
            "website": user_doc.get("website", ""),
            "is_verified": user_doc.get("is_verified", False),
            "created_at": str(user_doc.get("created_at", "")),
            "is_active": user_doc.get("is_active", True),
        }
