from fastapi import APIRouter, HTTPException, Depends, status
from schemas.examination import ExaminationCreate
from services.examination_service import (
    create_examination,
    get_user_examinations,
    get_examination_by_id,
)
from utils.dependencies import get_current_user

router = APIRouter(prefix="/examinations", tags=["Examinations"])


@router.post("")
async def save_examination(
    data: ExaminationCreate,
    current_user: dict = Depends(get_current_user),
):
    """Save a lung examination and its analysis result (authenticated users only)."""
    try:
        result = await create_examination(
            user_id=current_user["_id"],
            data=data.model_dump(),
        )
        return result
    except ConnectionError:
        raise HTTPException(status_code=503, detail="Database not available")


@router.get("/my")
async def get_my_examinations(current_user: dict = Depends(get_current_user)):
    """Get all examinations for the authenticated user."""
    examinations = await get_user_examinations(current_user["_id"])
    return {"examinations": examinations}


@router.get("/{examination_id}")
async def get_examination(
    examination_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single examination by ID (ownership verified)."""
    exam = await get_examination_by_id(examination_id, current_user["_id"])
    if exam is None:
        raise HTTPException(status_code=404, detail="Examination not found")
    return exam
