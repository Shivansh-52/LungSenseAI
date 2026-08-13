from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from bson import ObjectId
from database import get_database
from utils.security import decode_access_token

# Use HTTPBearer scheme — expects "Authorization: Bearer <token>"
security_scheme = HTTPBearer(auto_error=True)
optional_security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    """
    FastAPI dependency that validates the JWT token and returns the user document.
    Raises 401 if the token is invalid or user not found.
    """
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )

    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available",
        )

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Convert ObjectId to string for downstream use
    user["_id"] = str(user["_id"])
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(optional_security_scheme),
) -> dict | None:
    """
    FastAPI dependency that returns the user if a valid token is provided,
    or None if no token / invalid token (for guest-compatible endpoints).
    """
    if credentials is None:
        return None

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None

    db = get_database()
    if db is None:
        return None

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        return None

    user["_id"] = str(user["_id"])
    return user
