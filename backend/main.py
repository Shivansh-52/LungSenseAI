import os
import shutil
import tempfile
import time
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import List

from database import connect_to_mongo, close_mongo_connection, get_database
from ml.model import load_model, is_model_loaded, predict_audio
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
async def startup_event():
    await connect_to_mongo()
    load_model()


@app.on_event("shutdown")
async def shutdown_event():
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
    """Health check endpoint with database and model status."""
    db = get_database()
    db_status = "connected" if db is not None else "disconnected"

    try:
        if db is not None:
            await db.command("ping")
    except Exception:
        db_status = "error"

    return {
        "status": "healthy",
        "model_loaded": is_model_loaded(),
        "message": "LungSense AI backend is running",
        "database": db_status,
        "version": "2.0.0",
    }


@app.post("/predict")
async def predict(audio: UploadFile = File(...)):
    """
    Predict respiratory sound pattern from an audio file using frozen CNN + BiLSTM model.
    """
    if not audio:
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "MISSING_AUDIO", "message": "No audio file provided."}})
        
    filename = audio.filename.lower()
    if not (filename.endswith(".wav") or filename.endswith(".mp3") or filename.endswith(".m4a")):
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "UNSUPPORTED_FORMAT", "message": "Only .wav, .mp3, and .m4a are supported."}})
    
    # Store temporary file
    try:
        # Generate safe temporary filename
        fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(filename)[1])
        with os.fdopen(fd, "wb") as temp_file:
            shutil.copyfileobj(audio.file, temp_file)
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": {"code": "FILE_SAVE_ERROR", "message": "Could not save uploaded audio temporarily."}})
        
    # Inference
    try:
        prediction_result = predict_audio(temp_path)
    except ValueError as e:
        # Preprocessing error
        os.remove(temp_path)
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "INVALID_AUDIO", "message": "The uploaded audio could not be processed."}})
    except Exception as e:
        os.remove(temp_path)
        return JSONResponse(status_code=500, content={"success": False, "error": {"code": "INFERENCE_ERROR", "message": "Model inference failed."}})
        
    # Delete temporary file
    try:
        os.remove(temp_path)
    except Exception:
        pass
        
    return {
        "success": True,
        "prediction": {
            "class_id": prediction_result["class_id"],
            "class_name": prediction_result["class_name"],
            "confidence": prediction_result["confidence"]
        },
        "probabilities": prediction_result["probabilities"],
        "model": {
            "name": "CNN + BiLSTM",
            "version": "1.0"
        },
        "disclaimer": "This is an AI-assisted respiratory sound classification result and is not a medical diagnosis. Consult a qualified healthcare professional for medical evaluation."
    }


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
