from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from bson import ObjectId
from schemas.user import UserUpdate, HealthProfileCreate
from models.user import serialize_user, serialize_health_profile
from utils.dependencies import get_current_user
from database import get_database

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile with health profile."""
    db = get_database()
    user_data = serialize_user(current_user)

    if db:
        health_profile = await db.health_profiles.find_one({"user_id": current_user["_id"]})
        user_data["health_profile"] = serialize_health_profile(health_profile) if health_profile else None

    return user_data


@router.put("/me")
async def update_my_profile(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile fields."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_data["updated_at"] = datetime.utcnow()

    await db.users.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data},
    )

    updated_user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
    return {"user": serialize_user(updated_user)}


@router.delete("/me")
async def delete_my_account(current_user: dict = Depends(get_current_user)):
    """
    Delete user account and all associated data.
    This is irreversible.
    """
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = current_user["_id"]
    uid = ObjectId(user_id) if not isinstance(user_id, ObjectId) else user_id

    # Delete all user data across collections
    await db.users.delete_one({"_id": uid})
    await db.health_profiles.delete_many({"user_id": str(user_id)})
    await db.lung_examinations.delete_many({"user_id": str(user_id)})
    await db.health_metrics.delete_many({"user_id": str(user_id)})
    await db.medicine_reminders.delete_many({"user_id": str(user_id)})
    await db.wellness_plans.delete_many({"user_id": str(user_id)})
    await db.reports.delete_many({"user_id": str(user_id)})

    # Delete analysis results for user's examinations
    # (examination_ids are strings, so we need to find them first)
    # Already handled since examinations are deleted above

    return {"message": "Account and all associated data deleted successfully"}


@router.post("/health-profile")
async def create_or_update_health_profile(
    profile: HealthProfileCreate,
    current_user: dict = Depends(get_current_user),
):
    """Create or update the user's health profile."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    user_id = current_user["_id"]
    now = datetime.utcnow()

    profile_data = profile.model_dump()
    profile_data["user_id"] = str(user_id)
    profile_data["updated_at"] = now

    existing = await db.health_profiles.find_one({"user_id": str(user_id)})
    if existing:
        await db.health_profiles.update_one(
            {"_id": existing["_id"]},
            {"$set": profile_data},
        )
        updated = await db.health_profiles.find_one({"_id": existing["_id"]})
        return serialize_health_profile(updated)
    else:
        profile_data["created_at"] = now
        result = await db.health_profiles.insert_one(profile_data)
        profile_data["_id"] = result.inserted_id
        return serialize_health_profile(profile_data)
