from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from bson import ObjectId
from schemas.health import MedicineReminderCreate
from models.health import serialize_medicine_reminder
from utils.dependencies import get_current_user
from database import get_database

router = APIRouter(prefix="/medicines", tags=["Medicine Reminders"])


@router.post("")
async def create_medicine_reminder(
    data: MedicineReminderCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Create a medicine reminder.
    The user enters their medicine according to a healthcare professional's instructions.
    This app does NOT prescribe medicine, recommend dosage, or modify prescriptions.
    """
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    reminder_doc = {
        "user_id": current_user["_id"],
        "medicine_name": data.medicine_name,
        "dosage": data.dosage,
        "schedule": data.schedule,
        "notes": data.notes,
        "active": True,
        "created_at": datetime.utcnow(),
    }

    result = await db.medicine_reminders.insert_one(reminder_doc)
    reminder_doc["_id"] = result.inserted_id

    return serialize_medicine_reminder(reminder_doc)


@router.get("")
async def get_medicine_reminders(current_user: dict = Depends(get_current_user)):
    """Get all medicine reminders for the authenticated user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    cursor = db.medicine_reminders.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    reminders = []
    async for doc in cursor:
        reminders.append(serialize_medicine_reminder(doc))

    return {"reminders": reminders}


@router.put("/{reminder_id}")
async def update_medicine_reminder(
    reminder_id: str,
    data: MedicineReminderCreate,
    current_user: dict = Depends(get_current_user),
):
    """Update a medicine reminder (ownership verified)."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        reminder = await db.medicine_reminders.find_one({"_id": ObjectId(reminder_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Reminder not found")

    if reminder is None or str(reminder.get("user_id", "")) != current_user["_id"]:
        raise HTTPException(status_code=404, detail="Reminder not found")

    update_data = {
        "medicine_name": data.medicine_name,
        "dosage": data.dosage,
        "schedule": data.schedule,
        "notes": data.notes,
    }
    await db.medicine_reminders.update_one(
        {"_id": ObjectId(reminder_id)},
        {"$set": update_data},
    )

    updated = await db.medicine_reminders.find_one({"_id": ObjectId(reminder_id)})
    return serialize_medicine_reminder(updated)


@router.delete("/{reminder_id}")
async def delete_medicine_reminder(
    reminder_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a medicine reminder (ownership verified)."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    try:
        reminder = await db.medicine_reminders.find_one({"_id": ObjectId(reminder_id)})
    except Exception:
        raise HTTPException(status_code=404, detail="Reminder not found")

    if reminder is None or str(reminder.get("user_id", "")) != current_user["_id"]:
        raise HTTPException(status_code=404, detail="Reminder not found")

    await db.medicine_reminders.delete_one({"_id": ObjectId(reminder_id)})
    return {"message": "Reminder deleted successfully"}
