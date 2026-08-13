from fastapi import APIRouter, HTTPException, Depends, Query
from datetime import datetime
from schemas.health import HealthMetricCreate, BMIRequest, BMIResponse
from models.health import serialize_health_metric
from utils.dependencies import get_current_user
from database import get_database

router = APIRouter(prefix="/health", tags=["Health"])


@router.post("/metrics")
async def save_health_metric(
    data: HealthMetricCreate,
    current_user: dict = Depends(get_current_user),
):
    """Save a health metric (steps, water, sleep, weight, activity, nutrition)."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    metric_doc = {
        "user_id": current_user["_id"],
        "metric_type": data.metric_type,
        "value": data.value,
        "unit": data.unit,
        "recorded_at": datetime.utcnow(),
    }

    result = await db.health_metrics.insert_one(metric_doc)
    metric_doc["_id"] = result.inserted_id

    return serialize_health_metric(metric_doc)


@router.get("/metrics")
async def get_health_metrics(
    current_user: dict = Depends(get_current_user),
    metric_type: str = Query(None, description="Filter by metric type"),
    limit: int = Query(100, le=500),
):
    """Get health metrics for the authenticated user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    query = {"user_id": current_user["_id"]}
    if metric_type:
        query["metric_type"] = metric_type

    cursor = db.health_metrics.find(query).sort("recorded_at", -1).limit(limit)
    metrics = []
    async for doc in cursor:
        metrics.append(serialize_health_metric(doc))

    return {"metrics": metrics}


@router.get("/metrics/{metric_type}")
async def get_metrics_by_type(
    metric_type: str,
    current_user: dict = Depends(get_current_user),
    limit: int = Query(100, le=500),
):
    """Get health metrics by type for the authenticated user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    cursor = db.health_metrics.find({
        "user_id": current_user["_id"],
        "metric_type": metric_type,
    }).sort("recorded_at", -1).limit(limit)

    metrics = []
    async for doc in cursor:
        metrics.append(serialize_health_metric(doc))

    return {"metrics": metrics}


@router.post("/bmi", response_model=BMIResponse)
async def calculate_bmi(data: BMIRequest):
    """
    Calculate BMI from height (cm) and weight (kg).
    No authentication required — available to all users.
    """
    height_m = data.height / 100
    bmi = round(data.weight / (height_m * height_m), 1)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi <= 24.9:
        category = "Normal range"
    elif bmi <= 29.9:
        category = "Overweight"
    else:
        category = "Obese"

    return BMIResponse(
        bmi=bmi,
        category=category,
        disclaimer="BMI is a screening measure and does not provide a complete assessment of health.",
    )
