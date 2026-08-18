from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from app.db.mongodb import get_database
from app.utils.dependencies import get_current_user
from app.schemas.wellness import HealthProfileCreate, HealthProfileResponse

router = APIRouter(prefix="/health-profile", tags=["Health Profiles"])

def serialize_doc(doc: dict) -> dict:
    if not doc: return None
    doc["id"] = str(doc.pop("_id"))
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc

@router.get("", response_model=HealthProfileResponse)
async def get_health_profile(current_user: dict = Depends(get_current_user)):
    db = get_database()
    doc = await db.health_profiles.find_one({"user_id": current_user["_id"]})
    if not doc:
        raise HTTPException(status_code=404, detail="Health profile not found")
    return serialize_doc(doc)

@router.put("", response_model=HealthProfileResponse)
async def update_health_profile(profile: HealthProfileCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    doc = profile.dict()
    
    # Calculate BMI
    height_m = doc["height_cm"] / 100
    if height_m > 0 and doc["weight_kg"] > 0:
        doc["bmi"] = round(doc["weight_kg"] / (height_m * height_m), 1)
    else:
        doc["bmi"] = 0.0
        
    doc["user_id"] = current_user["_id"]
    doc["updated_at"] = datetime.utcnow()
    
    result = await db.health_profiles.find_one_and_update(
        {"user_id": current_user["_id"]},
        {"$set": doc},
        upsert=True,
        return_document=True
    )
    return serialize_doc(result)
