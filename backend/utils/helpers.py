"""
utils/helpers.py - Shared Helper Utilities

Provides reusable functions for API responses, ID formatting,
and timestamp generation.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import jsonify


def format_response(success: bool, message: str, data=None, status_code: int = 200):
    """
    Create a standardised Flask JSON response.

    Args:
        success:     Whether the operation was successful
        message:     Human-readable result message
        data:        Optional payload (dict or list)
        status_code: HTTP status code

    Returns:
        Tuple of (Flask Response, status_code) — ready to return from a route.
    """
    response = {
        "success": success,
        "message": message,
    }
    if data is not None:
        response["data"] = data
    return jsonify(response), status_code


def to_object_id(id_string: str):
    """
    Safely convert a string to a BSON ObjectId.
    Returns None if the string is not a valid ObjectId.
    """
    try:
        return ObjectId(id_string)
    except Exception:
        return None


def serialize_doc(doc: dict) -> dict:
    """
    Convert a MongoDB document's _id from ObjectId to string
    so it is JSON-serialisable.
    """
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


def serialize_docs(docs) -> list:
    """Serialize a list/cursor of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs]


def utc_now() -> datetime:
    """Return the current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)
