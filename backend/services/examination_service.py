from datetime import datetime
from bson import ObjectId
from database import get_database
from models.examination import serialize_examination, serialize_analysis_result


async def create_examination(user_id: str, data: dict) -> dict:
    """
    Create a lung examination and its analysis result.
    Returns the serialized examination with analysis.
    """
    db = get_database()
    if db is None:
        raise ConnectionError("Database not available")

    now = datetime.utcnow()

    # Create examination document
    exam_doc = {
        "user_id": user_id,
        "audio_reference": data.get("audio_reference", ""),
        "duration_seconds": data.get("duration_seconds", 0),
        "recorded_at": now,
        "status": "completed",
        "created_at": now,
    }
    exam_result = await db.lung_examinations.insert_one(exam_doc)
    exam_doc["_id"] = exam_result.inserted_id

    # Create analysis result document
    analysis_doc = {
        "examination_id": str(exam_result.inserted_id),
        "predicted_class": data.get("predicted_class", "Unknown"),
        "confidence": data.get("confidence", 0),
        "message": data.get("message", ""),
        "model_version": data.get("model_version", "mock-v1"),
        "created_at": now,
    }
    analysis_result = await db.lung_analysis_results.insert_one(analysis_doc)
    analysis_doc["_id"] = analysis_result.inserted_id

    return {
        "examination": serialize_examination(exam_doc),
        "analysis": serialize_analysis_result(analysis_doc),
    }


async def get_user_examinations(user_id: str, limit: int = 50) -> list:
    """Get all examinations for a user, sorted by most recent first."""
    db = get_database()
    if db is None:
        return []

    examinations = []
    cursor = db.lung_examinations.find({"user_id": user_id}).sort("recorded_at", -1).limit(limit)

    async for exam in cursor:
        serialized = serialize_examination(exam)

        # Fetch associated analysis result
        analysis = await db.lung_analysis_results.find_one({"examination_id": str(exam["_id"])})
        if analysis:
            serialized["analysis"] = serialize_analysis_result(analysis)

        examinations.append(serialized)

    return examinations


async def get_examination_by_id(examination_id: str, user_id: str) -> dict | None:
    """
    Get a single examination by ID, verifying ownership.
    Returns None if not found or not owned by user.
    """
    db = get_database()
    if db is None:
        return None

    try:
        exam = await db.lung_examinations.find_one({"_id": ObjectId(examination_id)})
    except Exception:
        return None

    if exam is None or str(exam.get("user_id", "")) != user_id:
        return None

    serialized = serialize_examination(exam)

    # Fetch associated analysis result
    analysis = await db.lung_analysis_results.find_one({"examination_id": examination_id})
    if analysis:
        serialized["analysis"] = serialize_analysis_result(analysis)

    return serialized
