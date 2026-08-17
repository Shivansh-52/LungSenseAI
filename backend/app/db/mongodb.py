from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGODB_URI, DATABASE_NAME

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Establish a single reusable MongoDB connection on startup."""
    global client, db
    if not MONGODB_URI or MONGODB_URI.startswith("mongodb+srv://<username>"):
        print("Warning: Valid MONGODB_URI not found in .env. Running without database.")
        return

    try:
        client = AsyncIOMotorClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        # Verify connection
        await client.admin.command("ping")
        print(f"Connected to MongoDB Atlas — database: {DATABASE_NAME}")
        await create_indexes()
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        db = None


async def close_mongo_connection():
    """Close the MongoDB client on shutdown."""
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


async def create_indexes():
    """Create useful indexes for performance and uniqueness constraints."""
    if db is None:
        return

    try:
        # Unique email index
        await db.users.create_index("email", unique=True)

        # Examination queries
        await db.examinations.create_index("user_id")
        await db.examinations.create_index("created_at")
        await db.examinations.create_index([("user_id", 1), ("created_at", -1)])

        print("MongoDB indexes created successfully.")
    except Exception as e:
        print(f"Warning: Could not create some indexes: {e}")


def get_database():
    """Get the database instance. Returns None if not connected."""
    return db
