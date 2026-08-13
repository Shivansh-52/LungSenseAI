from datetime import datetime
from database import get_database
from models.health import serialize_wellness_plan


def generate_default_wellness_plan(health_profile: dict = None) -> dict:
    """
    Generate a personalized wellness routine based on the user's health profile.
    This is NOT a medical treatment plan — it is general wellness guidance.
    """
    profile = health_profile or {}

    step_goal = profile.get("daily_step_goal", 10000)
    water_goal = profile.get("water_goal_ml", 2500)
    sleep_goal = profile.get("sleep_goal_hours", 8)
    activity_level = profile.get("activity_level", "moderate")
    diet_pref = profile.get("diet_preference", "")

    # Adjust activity suggestion based on level
    activity_suggestions = {
        "sedentary": "Start with a 15-minute walk after meals. Gradually increase to 30 minutes.",
        "light": "Aim for a 20–30 minute walk daily. Add light stretching in the morning.",
        "moderate": "Maintain 30–45 minutes of moderate activity. Mix walking with light exercises.",
        "active": "Continue your 45–60 minute activity routine. Include variety in exercises.",
        "very_active": "Great activity level! Ensure proper rest days and recovery between sessions.",
    }
    activity_tip = activity_suggestions.get(activity_level, activity_suggestions["moderate"])

    water_liters = round(water_goal / 1000, 1)

    morning_routine = [
        {"time": "7:00 AM", "activity": "Wake up", "description": "Start your day with consistency."},
        {"time": "7:10 AM", "activity": "Hydration", "description": f"Drink a glass of water (~250 ml). Daily target: {water_liters}L."},
        {"time": "7:20 AM", "activity": "Light stretching", "description": "5–10 minutes of gentle stretching to start your day."},
        {"time": "7:40 AM", "activity": "Breakfast", "description": f"Have a balanced breakfast.{' Consider ' + diet_pref + ' options.' if diet_pref else ''}"},
    ]

    day_routine = [
        {"time": "Throughout day", "activity": "Step target", "description": f"Aim for {step_goal:,} steps throughout the day."},
        {"time": "Every 1–2 hours", "activity": "Movement breaks", "description": "Stand, stretch, and walk for 2–3 minutes."},
        {"time": "Midday", "activity": "Hydration check", "description": f"Are you on track for your {water_liters}L water goal?"},
        {"time": "Afternoon", "activity": "Activity", "description": activity_tip},
    ]

    night_routine = [
        {"time": "1 hour before bed", "activity": "Screen break", "description": "Reduce screen time to help wind down."},
        {"time": "30 min before bed", "activity": "Relaxation", "description": "Light reading, deep breathing, or gentle stretching."},
        {"time": "Bedtime", "activity": "Consistent sleep", "description": f"Aim for {sleep_goal} hours of sleep per night."},
    ]

    goals = {
        "daily_steps": step_goal,
        "water_ml": water_goal,
        "sleep_hours": sleep_goal,
        "activity_level": activity_level,
    }

    return {
        "plan_name": "Personal Wellness Routine",
        "morning_routine": morning_routine,
        "day_routine": day_routine,
        "night_routine": night_routine,
        "goals": goals,
        "disclaimer": "General wellness guidance — not medical advice. Always consult a qualified healthcare professional for medical concerns.",
    }


async def get_or_create_wellness_plan(user_id: str) -> dict:
    """
    Get the user's wellness plan, creating one if it doesn't exist.
    Personalized based on health profile.
    """
    db = get_database()
    if db is None:
        # Return a default plan without persistence
        return generate_default_wellness_plan()

    # Check for existing plan
    existing = await db.wellness_plans.find_one({"user_id": user_id})
    if existing:
        return serialize_wellness_plan(existing)

    # Load health profile for personalization
    health_profile = await db.health_profiles.find_one({"user_id": user_id})
    plan_data = generate_default_wellness_plan(health_profile)

    # Save to database
    now = datetime.utcnow()
    plan_doc = {
        "user_id": user_id,
        **plan_data,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.wellness_plans.insert_one(plan_doc)
    plan_doc["_id"] = result.inserted_id

    return serialize_wellness_plan(plan_doc)
