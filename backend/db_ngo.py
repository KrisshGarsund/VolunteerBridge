"""
db_ngo.py - NGO Database Connection Module (Singleton Pattern)

Provides the MongoDB connection for the NGO portal.
Connects to the NGO database for user and help request data,
and reads from the volunteer database to fetch applicant details.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


class NGODatabase:
    """
    Singleton Database for the NGO portal.

    Connects to:
      - volunteerbridge_ngo (primary – NGO users, help requests)
      - volunteerbridge_volunteer (read – volunteer user details for applicants)
    """

    _instance = None
    _client_ngo = None
    _client_volunteer = None
    _db_ngo = None
    _db_volunteer = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NGODatabase, cls).__new__(cls)

            ngo_uri = os.getenv("MONGO_URI_NGO", "mongodb://localhost:27017/volunteerbridge_ngo")
            volunteer_uri = os.getenv("MONGO_URI_VOLUNTEER", "mongodb://localhost:27017/volunteerbridge_volunteer")

            cls._client_ngo = MongoClient(ngo_uri)
            cls._client_volunteer = MongoClient(volunteer_uri)

            cls._db_ngo = cls._client_ngo.get_database()
            cls._db_volunteer = cls._client_volunteer.get_database()

            print(f"[NGODB] Connected to: {cls._db_ngo.name}, {cls._db_volunteer.name}")
        return cls._instance

    @property
    def db(self):
        return self._db_ngo

    @property
    def users(self):
        """NGO users collection."""
        return self._db_ngo["users"]

    @property
    def help_requests(self):
        """Help requests collection (owned by NGOs)."""
        return self._db_ngo["help_requests"]

    @property
    def volunteer_users(self):
        """Read volunteer user data (for applicant details)."""
        return self._db_volunteer["users"]
