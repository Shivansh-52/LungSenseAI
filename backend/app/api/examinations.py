from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import Response, JSONResponse
from bson import ObjectId
from app.utils.dependencies import get_current_user
from app.db.mongodb import get_database
from app.models.examination import serialize_examination
from app.reports.pdf_report import generate_examination_pdf
from typing import Optional, Dict, Any
from pydantic import BaseModel
from app.reports.wellness import (
    get_class_interpretation,
    get_general_wellness_guidance,
    get_daily_routine,
    get_professional_guidance,
    get_disclaimer,
)
from datetime import datetime

class ExaminationPayload(BaseModel):
    sound_prediction: Dict[str, Any]
    disease_prediction: Optional[Dict[str, Any]] = None
    audio_metadata: Optional[Dict[str, Any]] = None


router = APIRouter(prefix="/examinations", tags=["Examinations"])

@router.post("")
async def create_examination(
    payload: ExaminationPayload,
    current_user: dict = Depends(get_current_user)
):
    """Save a unified examination containing sound and optional disease predictions."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    now = datetime.utcnow()
    exam_doc = {
        "user_id": current_user["_id"],
        "prediction": payload.sound_prediction.get("prediction", {}),
        "probabilities": payload.sound_prediction.get("probabilities", {}),
        "model": payload.sound_prediction.get("model", {"name": "CNN + BiLSTM", "version": "1.0"}),
        "disease_prediction": payload.disease_prediction,
        "audio_metadata": payload.audio_metadata,
        "source": "authenticated",
        "created_at": now
    }
    
    res = await db.examinations.insert_one(exam_doc)
    
    return {
        "success": True,
        "examination": {
            "saved": True,
            "id": str(res.inserted_id)
        }
    }

@router.get("")
async def get_examinations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get examination history for the authenticated user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    skip = (page - 1) * page_size
    user_id = current_user["_id"]

    cursor = db.examinations.find({"user_id": user_id}).sort("created_at", -1).skip(skip).limit(page_size)
    items = []
    async for doc in cursor:
        item = serialize_examination(doc)
        item["report_available"] = True
        items.append(item)

    total = await db.examinations.count_documents({"user_id": user_id})

    return {
        "success": True,
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total
    }


@router.get("/{examination_id}")
async def get_examination_details(
    examination_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get full details of a specific examination belonging to the authenticated user."""
    if not ObjectId.is_valid(examination_id):
        raise HTTPException(status_code=404, detail="Examination not found")

    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    doc = await db.examinations.find_one({"_id": ObjectId(examination_id)})
    
    if doc is None or doc.get("user_id") != current_user["_id"]:
        raise HTTPException(status_code=404, detail="Examination not found")

    exam_serialized = serialize_examination(doc)
    exam_serialized["report_available"] = True

    return {
        "success": True,
        "examination": exam_serialized,
        "disclaimer": get_disclaimer()
    }


@router.delete("/{examination_id}")
async def delete_examination(
    examination_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a specific examination belonging to the authenticated user."""
    if not ObjectId.is_valid(examination_id):
        raise HTTPException(status_code=404, detail="Examination not found")

    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    result = await db.examinations.delete_one({
        "_id": ObjectId(examination_id),
        "user_id": current_user["_id"]
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Examination not found")

    return {
        "success": True,
        "message": "Examination deleted successfully"
    }


@router.get("/{examination_id}/report-data")
async def get_examination_report_data(
    examination_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get structured report data for an examination."""
    if not ObjectId.is_valid(examination_id):
        raise HTTPException(status_code=400, detail="Invalid examination ID")

    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    doc = await db.examinations.find_one({"_id": ObjectId(examination_id)})
    if doc is None or doc.get("user_id") != current_user["_id"]:
        raise HTTPException(status_code=404, detail="Examination not found")

    prediction = doc.get("prediction", {})
    predicted_class = prediction.get("class_name", "Unknown")

    return {
        "report_title": "AI-Assisted Respiratory Sound Examination Report",
        "examination": serialize_examination(doc),
        "interpretation": get_class_interpretation(predicted_class),
        "wellness_guidance": get_general_wellness_guidance(),
        "daily_routine": get_daily_routine(),
        "professional_guidance": get_professional_guidance(),
        "disclaimer": get_disclaimer()
    }


@router.get("/{examination_id}/report")
async def get_examination_report_pdf(
    examination_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Download the PDF report for an examination."""
    if not ObjectId.is_valid(examination_id):
        raise HTTPException(status_code=400, detail="Invalid examination ID")

    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    doc = await db.examinations.find_one({"_id": ObjectId(examination_id)})
    if doc is None or doc.get("user_id") != current_user["_id"]:
        raise HTTPException(status_code=404, detail="Examination not found")

    try:
        pdf_bytes = generate_examination_pdf(doc, current_user)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="LungSenseAI_Report_{examination_id}.pdf"'}
        )
    except Exception as e:
        # Don't leak stack traces
        raise HTTPException(status_code=500, detail="Report generation failed")
