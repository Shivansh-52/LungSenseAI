from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class HealthProfileCreate(BaseModel):
    height_cm: float = Field(..., gt=0, description="Height in cm")
    weight_kg: float = Field(..., gt=0, description="Weight in kg")

class HealthProfileResponse(BaseModel):
    id: str
    user_id: str
    height_cm: float
    weight_kg: float
    bmi: float
    updated_at: str

class WaterEntryCreate(BaseModel):
    amount_ml: int = Field(..., gt=0, description="Amount of water in ml")
    date: str = Field(..., description="Local date string e.g. YYYY-MM-DD")

class WaterEntryResponse(BaseModel):
    id: str
    user_id: str
    amount_ml: int
    date: str
    updated_at: str

class SleepEntryCreate(BaseModel):
    sleep_time: str = Field(..., description="ISO datetime string")
    wake_time: str = Field(..., description="ISO datetime string")
    date: str = Field(..., description="Local date string e.g. YYYY-MM-DD")

class SleepEntryResponse(BaseModel):
    id: str
    user_id: str
    sleep_time: str
    wake_time: str
    duration_minutes: int
    date: str
    updated_at: str

class ActivityEntryCreate(BaseModel):
    activity_type: str
    duration_minutes: int = Field(..., gt=0)
    notes: Optional[str] = None
    date: str = Field(..., description="Local date string e.g. YYYY-MM-DD")

class ActivityEntryResponse(BaseModel):
    id: str
    user_id: str
    activity_type: str
    duration_minutes: int
    notes: Optional[str]
    date: str
    updated_at: str

class WellnessGoalsCreate(BaseModel):
    daily_steps: int = Field(8000, gt=0)
    daily_water_ml: int = Field(2500, gt=0)

class WellnessGoalsResponse(BaseModel):
    id: str
    user_id: str
    daily_steps: int
    daily_water_ml: int
    updated_at: str

class DailyWellnessSummary(BaseModel):
    date: str
    total_water_ml: int
    total_sleep_minutes: int
    total_activity_minutes: int
    total_steps: int = 0
    goals: Optional[WellnessGoalsResponse] = None
    score: int = Field(0, description="Wellness Progress Score (0-100)")
    score_label: str = "Needs Attention"
