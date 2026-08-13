"""
Examination and AnalysisResult document helpers for MongoDB.
"""


def serialize_examination(exam: dict) -> dict:
    """Convert a MongoDB lung_examination document to a JSON-safe dict."""
    if exam is None:
        return None
    return {
        "id": str(exam["_id"]),
        "user_id": str(exam.get("user_id", "")),
        "audio_reference": exam.get("audio_reference", ""),
        "duration_seconds": exam.get("duration_seconds", 0),
        "recorded_at": str(exam.get("recorded_at", "")),
        "status": exam.get("status", "completed"),
        "created_at": str(exam.get("created_at", "")),
    }


def serialize_analysis_result(result: dict) -> dict:
    """Convert a MongoDB lung_analysis_result document to a JSON-safe dict."""
    if result is None:
        return None
    return {
        "id": str(result["_id"]),
        "examination_id": str(result.get("examination_id", "")),
        "predicted_class": result.get("predicted_class", ""),
        "confidence": result.get("confidence", 0),
        "message": result.get("message", ""),
        "model_version": result.get("model_version", "mock-v1"),
        "created_at": str(result.get("created_at", "")),
    }
