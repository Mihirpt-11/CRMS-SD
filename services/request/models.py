from beanie import Document
from pydantic import BaseModel
from datetime import datetime
from typing import Optional



# DB Model: Service Request

class ServiceRequest(Document):
    user_id: str          
    faculty_id: Optional[str] = None
    title: str
    description: str
    status: str = "PENDING"  
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "service_requests"



# Input Schemas

class RequestCreate(BaseModel):
    user_id: str
    title: str
    description: str
    faculty_id: Optional[str] = None

class RequestStatusUpdate(BaseModel):
    status: str
