"""
seed_admin.py - Create the default Admin account

Run once to insert an admin user into the admin database.
Usage:  python seed_admin.py
"""

from dotenv import load_dotenv
load_dotenv()

from models.admin import Admin
from db_admin import AdminDatabase

db = AdminDatabase()

ADMIN_EMAIL = "admin@volunteerbridge.com"
ADMIN_PASSWORD = "Admin@1234"
ADMIN_NAME = "Platform Admin"

# Check if admin already exists
existing = db.users.find_one({"email": ADMIN_EMAIL})
if existing:
    print(f"[SEED] Admin account already exists: {ADMIN_EMAIL}")
else:
    admin = Admin(
        name=ADMIN_NAME,
        email=ADMIN_EMAIL,
        password=ADMIN_PASSWORD,
    )
    db.users.insert_one(admin.to_dict())
    print(f"[SEED] Admin account created successfully!")
    print(f"       Email:    {ADMIN_EMAIL}")
    print(f"       Password: {ADMIN_PASSWORD}")
