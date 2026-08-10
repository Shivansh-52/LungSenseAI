from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow requests from Android emulator (any origin for now)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "message": "LungSense AI backend is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # In future, load model and process the audio file.
    # For now, return a dummy response.
    dummy_response = {
        "label": "Wheeze",
        "confidence": 0.87,
        "message": "Wheezing respiratory sound pattern detected."
    }
    return JSONResponse(content=dummy_response)
