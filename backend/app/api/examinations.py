from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from app.utils.dependencies import get_current_user
from app.db.mongodb import get_database
from app.models.examination import serialize_examination

router = APIRouter(prefix="/examinations", tags=["Examinations"])

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
        items.append(serialize_examination(doc))

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
    
    # Do not leak whether another user's record exists, just return 404
    if doc is None or doc.get("user_id") != current_user["_id"]:
        raise HTTPException(status_code=404, detail="Examination not found")

    return {
        "success": True,
        "examination": serialize_examination(doc),
        "disclaimer": "AI-assisted respiratory sound classification. This is not a medical diagnosis and should not replace evaluation by a qualified healthcare professional."
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

    # Only delete if it belongs to current_user
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
