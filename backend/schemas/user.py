from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = ""
    date_of_birth: Optional[str] = ""
    gender: Optional[str] = ""
    created_at: Optional[str] = ""


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None


class HealthProfileCreate(BaseModel):
    height: Optional[float] = None
    weight: Optional[float] = None
    activity_level: Optional[str] = "moderate"
    daily_step_goal: Optional[int] = 10000
    water_goal_ml: Optional[int] = 2500
    sleep_goal_hours: Optional[int] = 8
    diet_preference: Optional[str] = ""


class HealthProfileResponse(BaseModel):
    id: str
    user_id: str
    height: Optional[float] = None
    weight: Optional[float] = None
    activity_level: Optional[str] = "moderate"
    daily_step_goal: Optional[int] = 10000
    water_goal_ml: Optional[int] = 2500
    sleep_goal_hours: Optional[int] = 8
    diet_preference: Optional[str] = ""
