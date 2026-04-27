"""
db_admin.py - Admin Database Connection Module (Singleton Pattern)

Provides the MongoDB connection for the Admin portal.
The admin connects to ALL THREE databases since it needs
platform-wide oversight (verify NGOs, deactivate users, analytics).
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


class AdminDatabase:
    """
    Singleton Database for the Admin portal.

    Connects to:
      - volunteerbridge_admin  (primary – analytics, logs)
      - volunteerbridge_volunteer (read – volunteer user data)
      - volunteerbridge_ngo (read – NGO user data, help requests)
    """

    _instance = None
    _client_admin = None
    _client_volunteer = None
    _client_ngo = None
    _db_admin = None
    _db_volunteer = None
    _db_ngo = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AdminDatabase, cls).__new__(cls)

            admin_uri = os.getenv("MONGO_URI_ADMIN", "mongodb://localhost:27017/volunteerbridge_admin")
            volunteer_uri = os.getenv("MONGO_URI_VOLUNTEER", "mongodb://localhost:27017/volunteerbridge_volunteer")
            ngo_uri = os.getenv("MONGO_URI_NGO", "mongodb://localhost:27017/volunteerbridge_ngo")

            cls._client_admin = MongoClient(admin_uri)
            cls._client_volunteer = MongoClient(volunteer_uri)
            cls._client_ngo = MongoClient(ngo_uri)

            cls._db_admin = cls._client_admin.get_database()
            cls._db_volunteer = cls._client_volunteer.get_database()
            cls._db_ngo = cls._client_ngo.get_database()

            print(f"[AdminDB] Connected to: {cls._db_admin.name}, {cls._db_volunteer.name}, {cls._db_ngo.name}")
        return cls._instance

    # ---- Primary admin database ----
    @property
    def db(self):
        return self._db_admin

    @property
    def users(self):
        """Admin users collection (stores admin accounts)."""
        return self._db_admin["users"]

    # ---- Cross-database access ----
    @property
    def volunteer_users(self):
        """Read volunteer users from the volunteer database."""
        return self._db_volunteer["users"]

    @property
    def ngo_users(self):
        """Read NGO users from the NGO database."""
        return self._db_ngo["users"]

    @property
    def help_requests(self):
        """Read help requests from the NGO database."""
        return self._db_ngo["help_requests"]

    def get_all_users_across_dbs(self):
        """Aggregate users from all 3 databases."""
        all_users = []
        all_users.extend(list(self._db_admin["users"].find({}, {"password_hash": 0})))
        all_users.extend(list(self._db_volunteer["users"].find({}, {"password_hash": 0})))
        all_users.extend(list(self._db_ngo["users"].find({}, {"password_hash": 0})))
        return all_users
