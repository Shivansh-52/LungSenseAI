from pydantic import BaseModel, field_validator
from typing import Optional


class HealthMetricCreate(BaseModel):
    metric_type: str  # steps, water, sleep, weight, activity, nutrition
    value: float
    unit: Optional[str] = ""

    @field_validator("metric_type")
    @classmethod
    def validate_metric_type(cls, v):
        allowed = ["steps", "water", "sleep", "weight", "activity", "nutrition"]
        if v not in allowed:
            raise ValueError(f"metric_type must be one of: {', '.join(allowed)}")
        return v


class HealthMetricResponse(BaseModel):
    id: str
    user_id: str
    metric_type: str
    value: float
    unit: str
    recorded_at: str


class BMIRequest(BaseModel):
    height: float  # cm
    weight: float  # kg

    @field_validator("height")
    @classmethod
    def validate_height(cls, v):
        if v <= 0 or v > 300:
            raise ValueError("Height must be between 0 and 300 cm")
        return v

    @field_validator("weight")
    @classmethod
    def validate_weight(cls, v):
        if v <= 0 or v > 500:
            raise ValueError("Weight must be between 0 and 500 kg")
        return v


class BMIResponse(BaseModel):
    bmi: float
    category: str
    disclaimer: str = "BMI is a screening measure and does not provide a complete assessment of health."


class MedicineReminderCreate(BaseModel):
    medicine_name: str
    dosage: Optional[str] = ""
    schedule: Optional[str] = ""
    notes: Optional[str] = ""

    @field_validator("medicine_name")
    @classmethod
    def validate_name(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError("Medicine name is required")
        return v.strip()


class MedicineReminderResponse(BaseModel):
    id: str
    user_id: str
    medicine_name: str
    dosage: str
    schedule: str
    notes: str
    active: bool
    created_at: str


class WellnessPlanResponse(BaseModel):
    id: Optional[str] = None
    plan_name: str
    morning_routine: list
    day_routine: list
    night_routine: list
    goals: dict
    disclaimer: str
