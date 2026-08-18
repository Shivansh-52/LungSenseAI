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


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


# ── Mount routers ─────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(predictions_router)
app.include_router(examinations_router)
app.include_router(wellness_router)
app.include_router(health_profiles_router)


# ── Health Endpoint ───────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint with database and model status."""
    db = get_database()
    db_status = True if db is not None else False

    try:
        if db is not None:
            await db.command("ping")
    except Exception:
        db_status = False

    return {
        "status": "healthy",
        "model_loaded": is_model_loaded(),
        "database_connected": db_status
    }
