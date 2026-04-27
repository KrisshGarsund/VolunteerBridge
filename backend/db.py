"""
db.py - Database Connection Module (Singleton Pattern)

Provides a single, reusable MongoDB connection instance for the entire
application. Uses PyMongo to connect to the MongoDB server specified
in the MONGO_URI environment variable.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Database:
    """
    Singleton Database class.
    Ensures only one MongoDB connection is created and reused across
    the entire application lifecycle.
    """

    _instance = None  # Holds the single class instance
    _client = None    # Holds the MongoClient connection
    _db = None        # Holds the database reference

    def __new__(cls):
        """Override __new__ to implement Singleton pattern."""
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            # Initialize the connection only once
            mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/volunteerbridge")
            cls._client = MongoClient(mongo_uri)
            cls._db = cls._client.get_database()
            print(f"[DB] Connected to MongoDB: {cls._db.name}")
        return cls._instance

    @property
    def db(self):
        """Returns the database instance."""
        return self._db

    @property
    def client(self):
        """Returns the MongoClient instance."""
        return self._client

    # ----- Collection accessors -----

    @property
    def users(self):
        """Returns the 'users' collection."""
        return self._db["users"]

    @property
    def help_requests(self):
        """Returns the 'help_requests' collection."""
        return self._db["help_requests"]


# Module-level convenience: import `db` directly from this module
database = Database()
db = database.db
