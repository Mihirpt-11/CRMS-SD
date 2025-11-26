import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import Resource, Booking

async def init_db():
    MONGO_URL = os.getenv("MONGODB_URL", "mongodb://mongodb:27017/campus")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.get_default_database()

    await init_beanie(
        database=db,
        document_models=[Resource, Booking]
    )
