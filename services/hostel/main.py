from fastapi import FastAPI, HTTPException
from fastapi import Depends
from auth_utils import get_current_user

from database import init_db
from models import (
    HostelRoom, HostelAllocation, MaintenanceRequest,
    RoomCreate, AllocationCreate, MaintenanceCreate
)
from events import publish_event
from datetime import datetime

app = FastAPI(title="Hostel Service")


@app.on_event("startup")
async def startup():
    await init_db()



# Create Room

@app.post("/hostel/room")
async def create_room(body: RoomCreate,user=Depends(get_current_user)):
    existing = await HostelRoom.find_one(HostelRoom.room_no == body.room_no)
    if existing:
        raise HTTPException(400, "Room already exists")
    
    room = HostelRoom(**body.dict())
    await room.insert()
    return {"message": "Room added", "room_id": str(room.id)}



# List Rooms

@app.get("/hostel/room")
async def list_rooms(user=Depends(get_current_user)):
    return await HostelRoom.find_all().to_list()



# Allocate Room

@app.post("/hostel/allocate")
async def allocate_room(body: AllocationCreate,user=Depends(get_current_user)):
    room = await HostelRoom.get(body.room_id)

    if not room:
        raise HTTPException(404, "Room not found")

    if room.occupied >= room.capacity:
        raise HTTPException(409, "Room is full")

    # Create allocation
    alloc = HostelAllocation(
        user_id=body.user_id,
        room_id=body.room_id,
        start_date=body.start_date,
        status="ALLOCATED"
    )
    await alloc.insert()

    # Update occupancy
    room.occupied += 1
    await room.save()

    # Publish event
    publish_event({
        "event": "hostel.allocation",
        "room_id": body.room_id,
        "user_id": body.user_id,
        "allocation_id": str(alloc.id)
    })

    return {"message": "Room allocated", "allocation_id": str(alloc.id)}



# Maintenance Request

@app.post("/hostel/maintenance")
async def create_maintenance(body: MaintenanceCreate,user=Depends(get_current_user)):
    maint = MaintenanceRequest(
        user_id=body.user_id,
        room_id=body.room_id,
        issue=body.issue
    )
    await maint.insert()

    # RabbitMQ notification
    publish_event({
        "event": "hostel.maintenance",
        "room_id": body.room_id,
        "user_id": body.user_id,
        "issue": body.issue
    })

    return {"message": "Maintenance request created", "request_id": str(maint.id)}



# Get maintenance requests by room

@app.get("/hostel/maintenance/{room_id}")
async def get_maintenance(room_id: str,user=Depends(get_current_user)):
    return await MaintenanceRequest.find(MaintenanceRequest.room_id == room_id).to_list()

@app.get("/hostel/maintenance/all")
async def all_maintenance(user=Depends(get_current_user)):
    return await MaintenanceRequest.find_all().sort("-created_at").to_list()


# Get allocations for a user

@app.get("/hostel/student/{user_id}")
async def student_allocations(user_id: str,user=Depends(get_current_user)):
    return await HostelAllocation.find(HostelAllocation.user_id == user_id).to_list()

@app.get("/hostel/room/{room_id}")
async def get_room(room_id: str,user=Depends(get_current_user)):
    room = await HostelRoom.get(room_id)
    if not room:
        raise HTTPException(404, "Room not found")
    return room

@app.get("/hostel/maintenance/all")
async def get_all_maintenance(user=Depends(get_current_user)):
    return await MaintenanceRequest.find_all().to_list()


