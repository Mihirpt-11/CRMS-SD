from beanie import Document
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# Hostel Room Collection

class HostelRoom(Document):
    room_no: str
    capacity: int
    occupied: int = 0

    class Settings:
        name = "hostel_rooms"



# Hostel Allocation Collection

class HostelAllocation(Document):
    user_id: str
    room_id: str
    start_date: datetime
    end_date: Optional[datetime] = None
    status: str = "ALLOCATED" 

    class Settings:
        name = "hostel_allocations"



# Maintenance Request Collection

class MaintenanceRequest(Document):
    user_id: str
    room_id: str
    issue: str
    status: str = "PENDING"
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "hostel_maintenance"



# Input Schemas

class RoomCreate(BaseModel):
    room_no: str
    capacity: int

class AllocationCreate(BaseModel):
    user_id: str
    room_id: str
    start_date: datetime

class MaintenanceCreate(BaseModel):
    user_id: str
    room_id: str
    issue: str

