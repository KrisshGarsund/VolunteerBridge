"""
services/admin_service.py - Admin Service (Abstraction Layer)

Business logic for admin-specific operations:
  - Verifying NGOs
  - Removing users
  - Fetching platform analytics

Updated to accept a database parameter (AdminDatabase) which
provides cross-database access to all 3 portal databases.
"""

from bson import ObjectId
from utils.helpers import serialize_doc, serialize_docs


class AdminService:
    """Handles all admin-related business logic."""

    def __init__(self, db=None):
        """
        Initialise AdminService.

        Args:
            db: An AdminDatabase instance (has access to all 3 databases).
                Falls back to legacy Database singleton if not provided.
        """
        if db is not None:
            self._db = db
        else:
            from db import Database
            self._db = Database()

    def verify_ngo(self, ngo_id: str) -> dict:
        """
        Mark an NGO as verified.

        Args:
            ngo_id: ID of the NGO to verify

        Returns:
            Updated NGO document

        Raises:
            ValueError: if user not found or not an NGO
        """
        oid = ObjectId(ngo_id)

        # NGO users are stored in the NGO database
        ngo_users = getattr(self._db, 'ngo_users', self._db.users)
        user_doc = ngo_users.find_one({"_id": oid})

        if not user_doc:
            raise ValueError("User not found")
        if user_doc.get("role") != "ngo":
            raise ValueError("This user is not an NGO")

        ngo_users.update_one(
            {"_id": oid},
            {"$set": {"is_verified": True}},
        )

        updated = ngo_users.find_one({"_id": oid})
        updated.pop("password_hash", None)
        return serialize_doc(updated)

    def remove_user(self, user_id: str) -> dict:
        """
        Deactivate a user account (soft delete).
        Checks all databases to find the user.

        Args:
            user_id: ID of the user to remove

        Returns:
            Confirmation dict

        Raises:
            ValueError: if user not found
        """
        oid = ObjectId(user_id)

        # Try to find user in all databases
        collections_to_check = []
        if hasattr(self._db, 'volunteer_users'):
            collections_to_check.append(self._db.volunteer_users)
        if hasattr(self._db, 'ngo_users'):
            collections_to_check.append(self._db.ngo_users)
        collections_to_check.append(self._db.users)

        for collection in collections_to_check:
            user_doc = collection.find_one({"_id": oid})
            if user_doc:
                collection.update_one(
                    {"_id": oid},
                    {"$set": {"is_active": False}},
                )
                return {"user_id": str(oid), "status": "deactivated"}

        raise ValueError("User not found")

    def get_all_users(self) -> list:
        """
        Return all users from all databases (without password hashes).
        """
        if hasattr(self._db, 'get_all_users_across_dbs'):
            return serialize_docs(self._db.get_all_users_across_dbs())
        else:
            users = self._db.users.find({}, {"password_hash": 0})
            return serialize_docs(users)

    def get_analytics(self) -> dict:
        """
        Compile platform-wide analytics across all databases.

        Returns:
            Dict with counts and breakdowns.
        """
        if hasattr(self._db, 'volunteer_users'):
            # Multi-database mode
            total_admins = self._db.users.count_documents({})
            total_volunteers = self._db.volunteer_users.count_documents({})
            total_ngos = self._db.ngo_users.count_documents({})
            verified_ngos = self._db.ngo_users.count_documents({"is_verified": True})
            total_users = total_admins + total_volunteers + total_ngos
        else:
            # Legacy single-database mode
            total_users = self._db.users.count_documents({})
            total_volunteers = self._db.users.count_documents({"role": "volunteer"})
            total_ngos = self._db.users.count_documents({"role": "ngo"})
            verified_ngos = self._db.users.count_documents({"role": "ngo", "is_verified": True})

        total_requests = self._db.help_requests.count_documents({})
        open_requests = self._db.help_requests.count_documents({"status": "open"})
        in_progress = self._db.help_requests.count_documents({"status": "in_progress"})
        completed = self._db.help_requests.count_documents({"status": "completed"})

        return {
            "users": {
                "total": total_users,
                "volunteers": total_volunteers,
                "ngos": total_ngos,
                "verified_ngos": verified_ngos,
            },
            "requests": {
                "total": total_requests,
                "open": open_requests,
                "in_progress": in_progress,
                "completed": completed,
            },
        }
