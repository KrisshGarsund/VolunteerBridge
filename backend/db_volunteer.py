"""
db_volunteer.py - Volunteer Database Connection Module (Singleton Pattern)

Provides the MongoDB connection for the Volunteer portal.
Connects to the volunteer database for user data, and reads
from the NGO database for available help requests.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()


class VolunteerDatabase:
    """
    Singleton Database for the Volunteer portal.

    Connects to:
      - volunteerbridge_volunteer (primary – volunteer users, tasks)
      - volunteerbridge_ngo (read – help requests created by NGOs)
    """

    _instance = None
    _client_volunteer = None
    _client_ngo = None
    _db_volunteer = None
    _db_ngo = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VolunteerDatabase, cls).__new__(cls)

            volunteer_uri = os.getenv("MONGO_URI_VOLUNTEER", "mongodb://localhost:27017/volunteerbridge_volunteer")
            ngo_uri = os.getenv("MONGO_URI_NGO", "mongodb://localhost:27017/volunteerbridge_ngo")

            cls._client_volunteer = MongoClient(volunteer_uri)
            cls._client_ngo = MongoClient(ngo_uri)

            cls._db_volunteer = cls._client_volunteer.get_database()
            cls._db_ngo = cls._client_ngo.get_database()

            print(f"[VolunteerDB] Connected to: {cls._db_volunteer.name}, {cls._db_ngo.name}")
        return cls._instance

    @property
    def db(self):
        return self._db_volunteer

    @property
    def users(self):
        """Volunteer users collection."""
        return self._db_volunteer["users"]

    @property
    def help_requests(self):
        """Help requests from the NGO database (cross-database read)."""
        return self._db_ngo["help_requests"]
