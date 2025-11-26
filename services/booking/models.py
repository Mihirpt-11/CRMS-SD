from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

# ---- Resource Collection ----
class Resource(Document):
    name: str
    type: str    
    location: str
    capacity: int

    class Settings:
        name = "resources"


# ---- Booking Collection ----
class Booking(Document):
    resource_id: str
    user_id: str
    start_time: datetime
    end_time: datetime
    status: str = "CONFIRMED"

    class Settings:
        name = "bookings"


# ---- Create/Update Booking Schemas ----
class BookingCreate(BaseModel):
    resource_id: str
    user_id: str
    start_time: datetime
    end_time: datetime

class ResourceCreate(BaseModel):
    name: str
    type: str
    location: str
    capacity: int
