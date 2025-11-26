from fastapi import FastAPI, HTTPException
from database import init_db
from models import Resource, Booking, BookingCreate, ResourceCreate
from cache import get_cached_availability, set_cached_availability, invalidate_cache
from events import publish_event
from datetime import datetime
from auth_utils import get_current_user
from fastapi import Depends

app = FastAPI(title="Booking Service")

@app.on_event("startup")
async def start():
    await init_db()



# Resource CRUD

@app.post("/booking/resource")
async def create_resource(body: ResourceCreate,user=Depends(get_current_user)):
    resource = Resource(**body.dict())
    await resource.insert()
    return {"message": "Resource created", "resource_id": str(resource.id)}

@app.get("/booking/resource")
async def list_resources(user=Depends(get_current_user)):
    resources = await Resource.find_all().to_list()
    return resources



# Booking Logic

@app.post("/booking/create")
async def create_booking(payload: BookingCreate,user = Depends(get_current_user)):

    # Convert date for cache key
    date_str = payload.start_time.strftime("%Y-%m-%d")

    
    cached = get_cached_availability(payload.resource_id, date_str)
    if cached:
        for b in cached:
            if not (payload.end_time <= b["start_time"] or payload.start_time >= b["end_time"]):
                raise HTTPException(409, "Slot not available (cached)")

    
    existing = await Booking.find(
        Booking.resource_id == payload.resource_id,
        Booking.start_time < payload.end_time,
        Booking.end_time > payload.start_time
    ).to_list()

    if existing:
        raise HTTPException(409, "Slot not available")

    
    booking = Booking(**payload.dict())
    await booking.insert()

    
    invalidate_cache(payload.resource_id, date_str)

    
    publish_event({
        "event": "booking.created",
        "booking_id": str(booking.id),
        "user_id": payload.user_id,
        "resource_id": payload.resource_id
    })

    return {"message": "Booking created", "booking_id": str(booking.id)}



# Get bookings by resource (with caching)

@app.get("/booking/resource/{resource_id}")
async def get_bookings(resource_id: str, date: str,user=Depends(get_current_user)):

    # Try cache
    cached = get_cached_availability(resource_id, date)
    if cached:
        return cached

    # Query DB
    start_date = datetime.fromisoformat(date)
    bookings = await Booking.find(
        Booking.resource_id == resource_id,
        Booking.start_time >= start_date,
    ).to_list()

    # Convert for cache
    result = [
        {
            "id": str(b.id),
            "start_time": b.start_time.isoformat(),
            "end_time": b.end_time.isoformat()
        }
        for b in bookings
    ]

    # Cache result
    set_cached_availability(resource_id, date, result)

    return result


@app.get("/booking/student/{user_id}")
async def bookings_for_student(user_id: str, user=Depends(get_current_user)):
    return await Booking.find(Booking.user_id == user_id).to_list()

@app.get("/booking/resource/{resource_id}/info")
async def get_resource_info(resource_id: str,user=Depends(get_current_user)):
    resource = await Resource.get(resource_id)
    if not resource:
        raise HTTPException(404, "Resource not found")
    return resource
