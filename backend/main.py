import os
import sys
import asyncio
from datetime import datetime, timezone

# On Windows dev machines, add FFmpeg to PATH if needed.
# On Linux (Render/production), FFmpeg is installed via apt and already in PATH.
if sys.platform == "win32":
    _ffmpeg_path = r"C:\Users\Shivansh\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin"
    if _ffmpeg_path not in os.environ.get("PATH", ""):
        os.environ["PATH"] = _ffmpeg_path + os.pathsep + os.environ.get("PATH", "")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import CORS_ORIGINS
from app.db.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.ml.model import load_model, is_model_loaded
from app.api.auth import router as auth_router
from app.api.predictions import router as predictions_router
from app.api.examinations import router as examinations_router
from app.ml.disease_model import load_disease_model, is_disease_model_loaded
from app.api.wellness import router as wellness_router
from app.api.health_profiles import router as health_profiles_router

logger = logging.getLogger("uvicorn.error")

app = FastAPI(
    title="LungSense AI API",
    description="AI-powered respiratory sound analysis — research/educational prototype",
    version="2.0.0",
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Internal Server Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected server error occurred."
            }
        }
    )

if "*" in CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# ── Lifecycle events ──────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    load_model()
    load_disease_model()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


# ── Mount routers ─────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(predictions_router)
app.include_router(examinations_router)
app.include_router(wellness_router)
app.include_router(health_profiles_router)


# ── Health & Keep-Alive Endpoints (Optimized for UptimeRobot & Render) ─────────

@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    """
    Root endpoint for UptimeRobot keep-alive monitoring.
    Returns HTTP 200 immediately to prevent Render free-tier instance from sleeping.
    """
    return {
        "status": "online",
        "service": "LungSense AI API",
        "version": "2.0.0",
        "keep_alive": "active",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.api_route("/ping", methods=["GET", "HEAD"])
async def ping():
    """
    Ultra-lightweight ping endpoint for zero-latency monitoring.
    """
    return {
        "ping": "pong",
        "status": "alive",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.api_route("/health", methods=["GET", "HEAD"])
async def health_check():
    """
    Health check endpoint with database and model status.
    Uses a 1.5s timeout safeguard so slow external DB responses never cause UptimeRobot timeouts.
    """
    db = get_database()
    db_status = False

    if db is not None:
        try:
            # 3.5s timeout to ensure reliable response across cloud regions
            await asyncio.wait_for(db.command("ping"), timeout=3.5)
            db_status = True
        except Exception:
            db_status = False

    return {
        "status": "healthy",
        "service": "LungSense AI API",
        "model_loaded": is_model_loaded(),
        "disease_model_loaded": is_disease_model_loaded(),
        "database_connected": db_status,
        "keep_alive": "active",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
