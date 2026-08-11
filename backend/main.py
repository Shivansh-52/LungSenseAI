import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime
from typing import List

load_dotenv()

app = FastAPI()

# Allow requests from Android emulator
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI")
client = None
db = None
collection = None

@app.on_event("startup")
async def startup_db_client():
    global client, db, collection
    if MONGO_URI and not MONGO_URI.startswith("mongodb+srv://<username>"):
        try:
            client = AsyncIOMotorClient(MONGO_URI)
            db = client.lungsense
            collection = db.history
            print("Connected to MongoDB Atlas!")
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
    else:
        print("Warning: Valid MONGO_URI not found in .env. Running without database.")

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()

# Pydantic Model for saving history
class PredictionResult(BaseModel):
    label: str
    confidence: float
    message: str

@app.get("/health")
async def health():
    return {"status": "ok", "message": "LungSense AI backend is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # In future, load ML model and process the audio file.
    # For now, return a dummy response.
    dummy_response = {
        "label": "Wheeze",
        "confidence": 0.87,
        "message": "Wheezing respiratory sound pattern detected."
    }
    return JSONResponse(content=dummy_response)

@app.post("/history")
async def save_history(result: PredictionResult):
    if collection is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    document = result.dict()
    document["timestamp"] = datetime.utcnow()
    
    await collection.insert_one(document)
    return {"status": "success", "message": "History saved"}

@app.get("/history")
async def get_history():
    if collection is None:
        raise HTTPException(status_code=503, detail="Database not configured")
    
    cursor = collection.find().sort("timestamp", -1).limit(50)
    history = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        history.append(doc)
        
    return {"history": history}
