import os
import shutil
import tempfile
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Depends
from fastapi.responses import JSONResponse

from app.ml.model import predict_audio
from app.utils.dependencies import get_optional_user
from app.db.mongodb import get_database

router = APIRouter(tags=["Predictions"])

@router.post("/predict")
async def predict(audio: UploadFile = File(...), user: dict = Depends(get_optional_user)):
    """
    Predict respiratory sound pattern from an audio file using frozen CNN + BiLSTM model.
    Guest (no token) -> does not save to DB.
    Authenticated (valid token) -> saves examination to DB.
    """
    if not audio:
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "MISSING_AUDIO", "message": "No audio file provided."}})
        
    filename = audio.filename.lower()
    if not (filename.endswith(".wav") or filename.endswith(".mp3") or filename.endswith(".m4a")):
        return JSONResponse(status_code=400, content={"success": False, "error": {"code": "UNSUPPORTED_FORMAT", "message": "Only .wav, .mp3, and .m4a are supported."}})
    
    # Store temporary file
    try:
        fd, temp_path = tempfile.mkstemp(suffix=os.path.splitext(filename)[1])
        with os.fdopen(fd, "wb") as temp_file:
            shutil.copyfileobj(audio.file, temp_file)
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": {"code": "FILE_SAVE_ERROR", "message": "Could not save uploaded audio temporarily."}})
        
    # Inference
    try:
        prediction_result = predict_audio(temp_path)
    except ValueError as e:
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

    # Save to MongoDB if authenticated
    examination_info = {"saved": False}
    if user:
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
