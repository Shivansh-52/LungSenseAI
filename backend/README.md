# LungSenseAI Backend

This is the FastAPI backend for the LungSenseAI system, an AI-assisted respiratory sound classification research prototype.

## Dependencies and Installation

The backend requires several ML libraries (PyTorch, librosa, torchaudio) and FastAPI components.

```bash
# Create a virtual environment (if not already using the ML one)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## How to Start FastAPI

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### `GET /health`
Verifies whether the backend and the underlying ML model are loaded and healthy.
**Response Format:**
```json
{
    "status": "healthy",
    "model_loaded": true,
    "message": "LungSense AI backend is running",
    "database": "disconnected",
    "version": "2.0.0"
}
```

### `POST /predict`
Performs ML inference on an uploaded audio file.
- **Request Format:** `multipart/form-data` with a single field named `audio` containing the file (.wav, .mp3, or .m4a).
- **Response Format:**
```json
{
    "success": true,
    "prediction": {
        "class_id": 2,
        "class_name": "Wheeze",
        "confidence": 0.3860
    },
    "probabilities": {
        "Normal": 0.3494,
        "Crackle": 0.1430,
        "Wheeze": 0.3860,
        "Crackle + Wheeze": 0.1215
    },
    "model": {
        "name": "CNN + BiLSTM",
        "version": "1.0"
    },
    "disclaimer": "This is an AI-assisted respiratory sound classification result and is not a medical diagnosis. Consult a qualified healthcare professional for medical evaluation."
}
```

## Machine Learning Integration
- **Model Location**: `models/cnn_lstm_best.pth` and `models/final_model_config.json`
- **Architecture**: CNN Feature Extractor (3 blocks) + Bidirectional LSTM + Linear Classifier.
- **Preprocessing**: Input audio is resampled to 16 kHz, peak-normalized, and padded/cropped to a fixed 4.6 seconds. A 64-bin Log-Mel spectrogram is generated (50–4000 Hz, FFT=400, Hop=160). 

## Local Testing
You can run local tests using the provided scripts.
```bash
# Test direct inference (bypass API)
python test_inference.py

# Test API endpoints (using FastAPI TestClient)
python test_api.py
```

## Disclaimer
This backend is an AI-assisted respiratory sound classification result and is not a medical diagnosis. Consult a qualified healthcare professional for medical evaluation.
