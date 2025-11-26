from fastapi import FastAPI, HTTPException
from database import init_db
from models import ServiceRequest, RequestCreate, RequestStatusUpdate
from events import publish_event
from fastapi import Depends
from auth_utils import get_current_user


app = FastAPI(title="Request Service")


@app.on_event("startup")
async def startup():
    await init_db()



# Create Service Request (Student)

@app.post("/request/create")
async def create_request(body: RequestCreate,user=Depends(get_current_user)):
    new_req = ServiceRequest(
        user_id=body.user_id,
        faculty_id=body.faculty_id,
        title=body.title,
        description=body.description,
        status="PENDING"
    )
    await new_req.insert()

    # Send RabbitMQ event
    publish_event({
        "event": "request.created",
        "request_id": str(new_req.id),
        "user_id": body.user_id,
        "faculty_id": body.faculty_id,
        "title": body.title
    })

    return {"message": "Request submitted", "request_id": str(new_req.id)}



# Get Requests for a Student

@app.get("/request/student/{user_id}")
async def student_requests(user_id: str,user=Depends(get_current_user)):
    reqs = await ServiceRequest.find(ServiceRequest.user_id == user_id).sort("-created_at").to_list()
    return reqs



# Get Requests for a Faculty

@app.get("/request/faculty/{faculty_id}")
async def faculty_requests(faculty_id: str,user=Depends(get_current_user)):
    reqs = await ServiceRequest.find_all().sort("-created_at").to_list()
    return reqs



# Update Request Status

@app.put("/request/update/{request_id}")
async def update_request(request_id: str, body: RequestStatusUpdate,user=Depends(get_current_user)):
    req = await ServiceRequest.get(request_id)

    if not req:
        raise HTTPException(404, "Request not found")

    req.status = body.status
    await req.save()

    # Produce event
    publish_event({
        "event": "request.updated",
        "request_id": request_id,
        "new_status": body.status
    })

    return {"message": "Status updated"}

@app.get("/request/all")
async def all_requests(user=Depends(get_current_user)):
    reqs = await ServiceRequest.find_all().sort("-created_at").to_list()
    return reqs

# Get a Single Request

@app.get("/request/{request_id}")
async def get_request(request_id: str,user=Depends(get_current_user)):
    req = await ServiceRequest.get(request_id)
    if not req:
        raise HTTPException(404, "Request not found")
    return req


