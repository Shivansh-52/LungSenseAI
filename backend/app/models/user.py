"""
User and HealthProfile document helpers for MongoDB.
"""


def serialize_user(user: dict) -> dict:
    """Convert a MongoDB user document to a JSON-safe dict."""
    if user is None:
        return None
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "created_at": str(user.get("created_at", "")),
        "updated_at": str(user.get("updated_at", "")),
        "is_active": user.get("is_active", True)
    }


def serialize_health_profile(profile: dict) -> dict:
    """Convert a MongoDB health_profile document to a JSON-safe dict."""
    if profile is None:
        return None
    return {
        "id": str(profile["_id"]),
        "user_id": str(profile.get("user_id", "")),
        "height": profile.get("height"),
        "weight": profile.get("weight"),
        "activity_level": profile.get("activity_level", "moderate"),
        "daily_step_goal": profile.get("daily_step_goal", 10000),
        "water_goal_ml": profile.get("water_goal_ml", 2500),
        "sleep_goal_hours": profile.get("sleep_goal_hours", 8),
        "diet_preference": profile.get("diet_preference", ""),
        "created_at": str(profile.get("created_at", "")),
        "updated_at": str(profile.get("updated_at", "")),
    }
