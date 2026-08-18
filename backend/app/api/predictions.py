import os
import shutil
import tempfile
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends, Request
from fastapi.responses import JSONResponse

from app.ml.model import predict_audio
from app.ml.disease_model import predict_disease
from app.utils.dependencies import get_optional_user
from app.db.mongodb import get_database
from app.config import MAX_UPLOAD_SIZE_MB
from app.utils.rate_limit import check_rate_limit

router = APIRouter(tags=["Predictions"])

@router.post("/predict/disease")
async def predict_disease_endpoint(request: Request, audio: UploadFile = File(...)):
    """
    Predict COPD-associated pattern from an audio file using frozen CNN + BiLSTM model.
    """
    check_rate_limit(request, max_requests=20, window_seconds=60)
    
    if not audio:
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "MISSING_AUDIO", "message": "No audio file provided."}})
        
    audio.file.seek(0, os.SEEK_END)
    file_size_mb = audio.file.tell() / (1024 * 1024)
    audio.file.seek(0)
    
    if file_size_mb > MAX_UPLOAD_SIZE_MB:
        return JSONResponse(status_code=413, content={"success": False, "error": {"code": "FILE_TOO_LARGE", "message": f"Audio file exceeds the maximum size of {MAX_UPLOAD_SIZE_MB}MB."}})

    filename = audio.filename.lower()
    if not (filename.endswith(".wav") or filename.endswith(".mp3") or filename.endswith(".m4a")):
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "UNSUPPORTED_FORMAT", "message": "Only .wav, .mp3, and .m4a are supported."}})
    
    temp_path = None
    try:
        fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(filename)[1])
        with os.fdopen(fd, "wb") as temp_file:
            shutil.copyfileobj(audio.file, temp_file)
            
        prediction_result = predict_disease(temp_path)
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": {"code": "INFERENCE_ERROR", "message": "Disease model inference failed."}})
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

    if prediction_result.get("status") != "success":
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "INVALID_AUDIO", "message": prediction_result.get("message", "Invalid audio.")}})
            
    return prediction_result


@router.post("/predict")
async def predict(request: Request, audio: UploadFile = File(...), save_exam: bool = True, user: dict = Depends(get_optional_user)):
    """
    Predict respiratory sound pattern from an audio file using frozen CNN + BiLSTM model.
    Guest (no token) -> does not save to DB.
    Authenticated (valid token) -> saves examination to DB unless save_exam=false.
    """
    check_rate_limit(request, max_requests=20, window_seconds=60)
    
    if not audio:
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "MISSING_AUDIO", "message": "No audio file provided."}})
        
    audio.file.seek(0, os.SEEK_END)
    file_size_mb = audio.file.tell() / (1024 * 1024)
    audio.file.seek(0)
    
    if file_size_mb > MAX_UPLOAD_SIZE_MB:
        return JSONResponse(status_code=413, content={"success": False, "error": {"code": "FILE_TOO_LARGE", "message": f"Audio file exceeds the maximum size of {MAX_UPLOAD_SIZE_MB}MB."}})

    filename = audio.filename.lower()
    if not (filename.endswith(".wav") or filename.endswith(".mp3") or filename.endswith(".m4a")):
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "UNSUPPORTED_FORMAT", "message": "Only .wav, .mp3, and .m4a are supported."}})
    
    temp_path = None
    try:
        fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(filename)[1])
        with os.fdopen(fd, "wb") as temp_file:
            shutil.copyfileobj(audio.file, temp_file)
            
        prediction_result = predict_audio(temp_path)
        
    except ValueError as e:
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "INVALID_AUDIO", "message": "The uploaded audio could not be processed."}})
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": {"code": "INFERENCE_ERROR", "message": "Model inference failed."}})
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

    # Save to MongoDB if authenticated and save_exam is true
    examination_info = {"saved": False}
    if user and save_exam:
        db = get_database()
        if db is not None:
            now = datetime.utcnow()
            exam_doc = {
                "user_id": user["_id"],
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
                "source": "authenticated",
                "created_at": now
            }
            res = await db.examinations.insert_one(exam_doc)
            examination_info = {
                "saved": True,
                "id": str(res.inserted_id)
            }
            
    return {
        "success": True,
        "prediction": {
            "class_id": prediction_result["class_id"],
            "class_name": prediction_result["class_name"],
            "confidence": prediction_result["confidence"]
        },
        "probabilities": prediction_result["probabilities"],
        "examination": examination_info,
        "model": {
            "name": "CNN + BiLSTM",
            "version": "1.0"
        },
        "disclaimer": "This is an AI-assisted respiratory sound classification result and is not a medical diagnosis. Consult a qualified healthcare professional for medical evaluation."
    }
