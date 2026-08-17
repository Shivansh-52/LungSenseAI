from fastapi import APIRouter, Depends
from services.wellness_service import get_or_create_wellness_plan
from utils.dependencies import get_current_user

router = APIRouter(prefix="/wellness", tags=["Wellness"])


@router.get("/plan")
async def get_wellness_plan(current_user: dict = Depends(get_current_user)):
    """
    Get the user's personalized wellness routine.
    Generated based on health profile data.
    This is general wellness guidance — NOT medical advice.
    """
    plan = await get_or_create_wellness_plan(current_user["_id"])
    return plan
