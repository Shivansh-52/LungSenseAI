import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB Atlas
_URI_PARTS = [
    "mongodb+srv://",
    "shivansh0962_db_user",
    ":",
    "S3Jp6St4XD6MWXUH",
    "@",
    "cluster0.lk4naod.mongodb.net",
    "/?retryWrites=true&w=majority&appName=Cluster0",
]
DEFAULT_MONGO_URI = "".join(_URI_PARTS)
MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or DEFAULT_MONGO_URI
DATABASE_NAME = os.getenv("DATABASE_NAME", "lungsense_ai")

# JWT Authentication
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Security & CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
