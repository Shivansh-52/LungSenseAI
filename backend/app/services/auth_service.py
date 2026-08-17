from datetime import datetime
from app.db.mongodb import get_database
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.models.user import serialize_user


async def get_user_by_email(email: str) -> dict | None:
    """Find a user by email address."""
    db = get_database()
    if db is None:
        return None
    return await db.users.find_one({"email": email.lower().strip()})


async def register_user(name: str, email: str, password: str) -> dict:
    """
    Register a new user. Returns {"access_token": ..., "user": ...}.
    Raises ValueError if email already exists.
    """
    db = get_database()
    if db is None:
        raise ConnectionError("Database not available")

    # Check for duplicate email
    existing = await db.users.find_one({"email": email.lower().strip()})
    if existing:
        raise ValueError("An account with this email already exists")

    now = datetime.utcnow()
    user_doc = {
        "name": name.strip(),
        "email": email.lower().strip(),
        "password_hash": hash_password(password),
        "created_at": now,
        "updated_at": now,
        "is_active": True,
    }

    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    # Create JWT token
    token = create_access_token({"sub": str(result.inserted_id)})
    serialized = serialize_user(user_doc)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialized,
    }


async def authenticate_user(email: str, password: str) -> dict:
    """
    Authenticate a user with email and password. Returns {"access_token": ..., "user": ...}.
    Raises ValueError if credentials are invalid.
    """
    db = get_database()
    if db is None:
        raise ConnectionError("Database not available")

    user = await db.users.find_one({"email": email.lower().strip()})
    if user is None:
        raise ValueError("Invalid email or password")

    if not verify_password(password, user.get("password_hash", "")):
        raise ValueError("Invalid email or password")

    # Create JWT token
    token = create_access_token({"sub": str(user["_id"])})
    serialized = serialize_user(user)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialized,
    }
