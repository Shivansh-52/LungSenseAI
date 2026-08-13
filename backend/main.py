import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List

from database import connect_to_mongo, close_mongo_connection, get_database
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.examinations import router as examinations_router
from routes.health import router as health_router
from routes.wellness import router as wellness_router
from routes.reports import router as reports_router
from routes.medicines import router as medicines_router

app = FastAPI(
    title="LungSense AI API",
    description="AI-powered respiratory sound analysis — research/educational prototype",
    version="2.0.0",
)

# Allow requests from Android emulator and physical devices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Lifecycle events ──────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()


# ── Mount routers ─────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(examinations_router)
app.include_router(health_router)
app.include_router(wellness_router)
app.include_router(reports_router)
app.include_router(medicines_router)


# ── Preserved original endpoints ──────────────────────────────────────────────

# Pydantic Model for saving history (backward-compatible with existing app)
class PredictionResult(BaseModel):
    label: str
    confidence: float
    message: str


@app.get("/health")
async def health_check():
    """Health check endpoint with database status."""
    db = get_database()
    db_status = "connected" if db is not None else "disconnected"

    try:
        if db is not None:
            await db.command("ping")
    except Exception:
        db_status = "error"

    return {
        "status": "ok",
        "message": "LungSense AI backend is running",
        "database": db_status,
        "version": "2.0.0",
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Predict respiratory sound pattern from an audio file.
    Currently returns a mock/dummy response.
    Future: ICBHI CNN model integration.
    """
    # In future, load ML model and process the audio file.
    # For now, return a dummy response.
    dummy_response = {
        "label": "Wheeze",
        "confidence": 0.87,
        "message": "Wheezing respiratory sound pattern detected."
    }
    return JSONResponse(content=dummy_response)


@app.post("/history")
async def save_history(result: PredictionResult):
    """Save a prediction result to history (backward-compatible endpoint)."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")

    # Use the legacy 'history' collection for backward compatibility
    collection = db.history

    document = result.model_dump()
    document["timestamp"] = datetime.utcnow()

    await collection.insert_one(document)
    return {"status": "success", "message": "History saved"}


@app.get("/history")
async def get_history():
    """Get prediction history (backward-compatible endpoint)."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not configured")

    collection = db.history

    cursor = collection.find().sort("timestamp", -1).limit(50)
    history = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        history.append(doc)

    return {"history": history}
