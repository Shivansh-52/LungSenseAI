from pydantic import BaseModel
from typing import Dict
from datetime import datetime

class PredictionDetails(BaseModel):
    class_id: int
    class_name: str
    confidence: float

class ModelInfo(BaseModel):
    name: str
    version: str

class ExaminationResponse(BaseModel):
    id: str
    user_id: str
    prediction: PredictionDetails
    probabilities: Dict[str, float]
    model: ModelInfo
    source: str
    created_at: str

def serialize_examination(exam: dict) -> dict:
    if not exam:
        return None
    return {
        "id": str(exam["_id"]),
        "user_id": str(exam.get("user_id", "")),
        "prediction": exam.get("prediction", {}),
        "probabilities": exam.get("probabilities", {}),
        "model": exam.get("model", {}),
        "disease_prediction": exam.get("disease_prediction", None),
        "audio_metadata": exam.get("audio_metadata", None),
        "source": exam.get("source", ""),
        "created_at": str(exam.get("created_at", ""))
    }
