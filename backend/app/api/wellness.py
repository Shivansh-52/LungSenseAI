from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from typing import List, Dict
from app.db.mongodb import get_database
from app.utils.dependencies import get_current_user
from app.schemas.wellness import (
    HealthProfileCreate, HealthProfileResponse,
    WaterEntryCreate, WaterEntryResponse,
    SleepEntryCreate, SleepEntryResponse,
    ActivityEntryCreate, ActivityEntryResponse,
    WellnessGoalsCreate, WellnessGoalsResponse,
    DailyWellnessSummary
)
from app.services.wellness_service import get_or_create_wellness_plan
from bson import ObjectId

router = APIRouter(prefix="/wellness", tags=["Wellness"])

def serialize_doc(doc: dict) -> dict:
    if not doc: return None
    doc["id"] = str(doc.pop("_id"))
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
        if isinstance(v, ObjectId):
            doc[k] = str(v)
    return doc

@router.get("/plan")
async def get_wellness_plan(current_user: dict = Depends(get_current_user)):
    plan = await get_or_create_wellness_plan(current_user["_id"])
    return plan

@router.get("/today", response_model=DailyWellnessSummary)
async def get_wellness_today(date: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["_id"]
    
    # Fetch water
    water_docs = await db.hydration.find({"user_id": user_id, "date": date}).to_list(length=100)
    total_water = sum(doc.get("amount_ml", 0) for doc in water_docs)
    
    # Fetch sleep
    sleep_docs = await db.sleep_logs.find({"user_id": user_id, "date": date}).to_list(length=100)
    total_sleep = sum(doc.get("duration_minutes", 0) for doc in sleep_docs)
    
    # Fetch activity
    activity_docs = await db.daily_activity.find({"user_id": user_id, "date": date}).to_list(length=100)
    total_activity = sum(doc.get("duration_minutes", 0) for doc in activity_docs)
    
    # Fetch goals
    goals_doc = await db.wellness_goals.find_one({"user_id": user_id})
    goals = serialize_doc(goals_doc) if goals_doc else None
    
    # Basic score calculation (dummy logic for wellness score)
    score = 0
    if goals:
        water_progress = min(100, (total_water / goals.get("daily_water_ml", 2500)) * 100)
        score += water_progress * 0.5
    else:
        score += min(100, (total_water / 2500) * 100) * 0.5
        
    score += min(100, (total_sleep / (8*60)) * 100) * 0.25
    score += min(100, (total_activity / 30) * 100) * 0.25
    score = int(min(100, score))
    
    if score >= 80: score_label = "Excellent Progress"
    elif score >= 60: score_label = "Good Progress"
    elif score >= 40: score_label = "Moderate Progress"
    else: score_label = "Needs Attention"
    
    return {
        "date": date,
        "total_water_ml": total_water,
        "total_sleep_minutes": total_sleep,
        "total_activity_minutes": total_activity,
        "total_steps": 0, # Steps would be sent separately if tracking
        "goals": goals,
        "score": score,
        "score_label": score_label
    }

@router.post("/water", response_model=WaterEntryResponse)
async def add_water_entry(entry: WaterEntryCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    doc = entry.dict()
    doc["user_id"] = current_user["_id"]
    doc["updated_at"] = datetime.utcnow()
    
    result = await db.hydration.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)

@router.get("/water", response_model=List[WaterEntryResponse])
async def get_water_entries(date: str = None, current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {"user_id": current_user["_id"]}
    if date: query["date"] = date
    docs = await db.hydration.find(query).to_list(length=100)
    return [serialize_doc(doc) for doc in docs]

@router.post("/sleep", response_model=SleepEntryResponse)
async def add_sleep_entry(entry: SleepEntryCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    doc = entry.dict()
    
    # Calculate duration
    try:
        sleep_dt = datetime.fromisoformat(entry.sleep_time.replace('Z', '+00:00'))
        wake_dt = datetime.fromisoformat(entry.wake_time.replace('Z', '+00:00'))
        duration = int((wake_dt - sleep_dt).total_seconds() / 60)
        doc["duration_minutes"] = max(0, duration)
    except:
        doc["duration_minutes"] = 0
        
    doc["user_id"] = current_user["_id"]
    doc["updated_at"] = datetime.utcnow()
    
    result = await db.sleep_logs.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)

@router.get("/sleep", response_model=List[SleepEntryResponse])
async def get_sleep_entries(date: str = None, current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {"user_id": current_user["_id"]}
    if date: query["date"] = date
    docs = await db.sleep_logs.find(query).to_list(length=100)
    return [serialize_doc(doc) for doc in docs]

@router.post("/activity", response_model=ActivityEntryResponse)
async def add_activity_entry(entry: ActivityEntryCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    doc = entry.dict()
    doc["user_id"] = current_user["_id"]
    doc["updated_at"] = datetime.utcnow()
    
    result = await db.daily_activity.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)

@router.get("/activity", response_model=List[ActivityEntryResponse])
async def get_activity_entries(date: str = None, current_user: dict = Depends(get_current_user)):
    db = get_database()
    query = {"user_id": current_user["_id"]}
    if date: query["date"] = date
    docs = await db.daily_activity.find(query).to_list(length=100)
    return [serialize_doc(doc) for doc in docs]

@router.get("/goals", response_model=WellnessGoalsResponse)
async def get_wellness_goals(current_user: dict = Depends(get_current_user)):
    db = get_database()
    doc = await db.wellness_goals.find_one({"user_id": current_user["_id"]})
    if not doc:
        return {"id": "default", "user_id": current_user["_id"], "daily_steps": 8000, "daily_water_ml": 2500, "updated_at": datetime.utcnow().isoformat()}
    return serialize_doc(doc)

@router.put("/goals", response_model=WellnessGoalsResponse)
async def update_wellness_goals(goals: WellnessGoalsCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    doc = goals.dict()
    doc["user_id"] = current_user["_id"]
    doc["updated_at"] = datetime.utcnow()
    
    result = await db.wellness_goals.find_one_and_update(
        {"user_id": current_user["_id"]},
        {"$set": doc},
        upsert=True,
        return_document=True
    )
    return serialize_doc(result)
