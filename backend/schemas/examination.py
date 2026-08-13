from pydantic import BaseModel
from typing import Optional


class ExaminationCreate(BaseModel):
    audio_reference: Optional[str] = ""
    duration_seconds: Optional[float] = 0
    predicted_class: str
    confidence: float
    message: str
    model_version: Optional[str] = "mock-v1"


class ExaminationResponse(BaseModel):
    id: str
    user_id: str
    audio_reference: Optional[str] = ""
    duration_seconds: Optional[float] = 0
    recorded_at: str
    status: str


class AnalysisResultResponse(BaseModel):
    id: str
    examination_id: str
    predicted_class: str
    confidence: float
    message: str
    model_version: str
    created_at: str


class ExaminationDetailResponse(BaseModel):
    examination: ExaminationResponse
    analysis: Optional[AnalysisResultResponse] = None
