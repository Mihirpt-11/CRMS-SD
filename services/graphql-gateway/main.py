import os
import asyncio
import json
import strawberry
from strawberry.fastapi import GraphQLRouter
from fastapi import FastAPI, Request
import httpx
import redis.asyncio as aioredis
from typing import List, Optional
from auth_utils import decode_token
from fastapi import HTTPException


REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
BOOKING_URL = os.getenv("BOOKING_URL", "http://booking_pool")
REQUEST_URL = os.getenv("REQUEST_URL", "http://request_pool")
HOSTEL_URL = os.getenv("HOSTEL_URL", "http://hostel_pool")
AUTH_URL = os.getenv("AUTH_URL", "http://auth_pool")


CACHE_TTL = int(os.getenv("CACHE_TTL", "30"))

redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)

def authenticate(request: Request):
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(401, "Missing Authorization header")

    scheme, _, token = auth_header.partition(" ")

    if scheme.lower() != "bearer":
        raise HTTPException(401, "Invalid auth scheme")

    return decode_token(token)



# GraphQL Schema Types

@strawberry.type
class BookingInfo:
    id: str
    resource_id: str
    start_time: str
    end_time: str
    status: Optional[str]
    resource_name: Optional[str]
    resource_type: Optional[str]
    location: Optional[str]



@strawberry.type
class ServiceReqInfo:
    id: str
    title: str
    description: Optional[str]
    status: Optional[str]


@strawberry.type
class HostelInfo:
    room_id: str
    room_no: Optional[str]
    status: Optional[str]

@strawberry.type
class MaintenanceInfo:
    id: str
    room_id: str
    issue: Optional[str]
    status: Optional[str]
    user_id: Optional[str]
    created_at: Optional[str]


@strawberry.type
class StudentDashboard:
    bookings: List[BookingInfo]
    requests: List[ServiceReqInfo]
    hostel: List[HostelInfo]
    maintenance: List[MaintenanceInfo]







# HTTP Utility

async def _get_json(url: str, headers=None):
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        return resp.json()



# Resolvers

@strawberry.type
class Query:

    @strawberry.field
    async def student_dashboard(self, info, student_id: str) -> StudentDashboard:
        user = info.context["user"]

        # Students can access ONLY their own dashboard
        if user["role"] == "student" and user["sub"] != student_id:
            raise HTTPException(403, "Forbidden")

        # Forward Authorization Header
        headers = {}
        request: Request = info.context["request"]
        auth_header = request.headers.get("authorization")
        if auth_header:
            headers["Authorization"] = auth_header

        # ------- Redis Cache -------
        cache_key = f"dashboard:{student_id}"
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return StudentDashboard(
                bookings=[BookingInfo(**b) for b in data["bookings"]],
                requests=[ServiceReqInfo(**r) for r in data["requests"]],
                hostel=[HostelInfo(**h) for h in data["hostel"]],
                maintenance=[MaintenanceInfo(**m) for m in data["maintenance"]]
            )

        # ------- Internal URLs -------
        booking_url = f"{BOOKING_URL}/booking/student/{student_id}"
        request_url = f"{REQUEST_URL}/request/student/{student_id}"
        hostel_url = f"{HOSTEL_URL}/hostel/student/{student_id}"

        # Fetch basic data (bookings, requests, hostel allocations)
        booking_data, request_data, hostel_data = await asyncio.gather(
            _get_json(booking_url, headers),
            _get_json(request_url, headers),
            _get_json(hostel_url, headers)
        )

        
        # FETCH RESOURCE DETAILS (JOIN)
        
        resource_ids = list({b.get("resource_id") for b in booking_data})

        resource_details = await asyncio.gather(*[
            _get_json(f"{BOOKING_URL}/booking/resource/{res_id}/info", headers)
            for res_id in resource_ids
        ])

        resource_map = {
            str(res.get("_id", res.get("id"))): res
            for res in resource_details
        }

        
        # FETCH ROOM DETAILS (JOIN for hostel rooms)
        
        room_ids = [alloc.get("room_id") for alloc in hostel_data]
        
        # Fetch ALL maintenance requests
        all_maintenance = await _get_json(f"{HOSTEL_URL}/hostel/maintenance/all", headers)

        # Filter for student only
        flat_maintenance = [
            m for m in all_maintenance
            if m.get("user_id") == student_id
        ]

        



        # For each room, call: GET /hostel/room/<room_id>
        room_details = await asyncio.gather(*[
            _get_json(f"{HOSTEL_URL}/hostel/room/{room_id}", headers)
            for room_id in room_ids
        ])

        room_map = {
            str(room.get("_id", room.get("id"))): room
            for room in room_details
        }

        
        # BUILD BOOKINGS LIST (joined)
        
        bookings_list = []
        for b in booking_data:
            rid = b.get("resource_id")
            rinfo = resource_map.get(rid, {})

            bookings_list.append(
                BookingInfo(
                    id=str(b.get("_id", b.get("id"))),
                    resource_id=rid,
                    start_time=str(b.get("start_time")),
                    end_time=str(b.get("end_time")),
                    status=b.get("status"),
                    resource_name=rinfo.get("name"),
                    resource_type=rinfo.get("type"),
                    location=rinfo.get("location")
                )
            )

        
        # BUILD REQUESTS LIST
        
        requests_list = [
            ServiceReqInfo(
                id=str(r.get("_id", r.get("id"))),
                title=r.get("title"),
                description=r.get("description"),
                status=r.get("status")
            )
            for r in request_data
        ]

        
        # BUILD HOSTEL (joined)
        
        hostel_list = []
        for alloc in hostel_data:
            room = room_map.get(alloc.get("room_id"), {})
            hostel_list.append(
                HostelInfo(
                    room_id=str(alloc.get("room_id")),
                    room_no=room.get("room_no"),
                    status=alloc.get("status")
                )
            )
        maintenance_list = [
        MaintenanceInfo(
            id=str(m.get("_id", m.get("id"))),
            room_id=m.get("room_id"),
            issue=m.get("issue"),
            status=m.get("status"),
            user_id=m.get("user_id"),
            created_at=m.get("created_at")
        )
        for m in flat_maintenance
]

        
        # STORE IN CACHE
        
        combined = {
            "bookings": [b.__dict__ for b in bookings_list],
            "requests": [r.__dict__ for r in requests_list],
            "hostel": [h.__dict__ for h in hostel_list],
            "maintenance": [m.__dict__ for m in maintenance_list]
        }
        


        await redis_client.set(cache_key, json.dumps(combined), ex=CACHE_TTL)
        return StudentDashboard(
            bookings=bookings_list,
            requests=requests_list,
            hostel=hostel_list,
            maintenance=maintenance_list
        )


    @strawberry.field
    async def resource_availability(self, info, resource_id: str, date: str) -> List[BookingInfo]:

        headers = {}
        request: Request = info.context["request"]
        auth_header = request.headers.get("authorization")
        if auth_header:
            headers["Authorization"] = auth_header

        # Correct internal URL
        booking_url = (
            f"{BOOKING_URL}/booking/resource/{resource_id}?date={date}"
        )

        result = await _get_json(booking_url, headers)

        return [
            BookingInfo(
                id=str(item.get("_id", item.get("id"))),
                resource_id=resource_id,
                start_time=item.get("start_time"),
                end_time=item.get("end_time"),
                status=item.get("status")
            )
            for item in result
        ]


schema = strawberry.Schema(Query)

app = FastAPI(title="GraphQL Gateway")

# async def get_context(request: Request):
#     return {"request": request}
async def get_context(request: Request):
    user = authenticate(request)  # Validate JWT and extract payload
    return {
        "request": request,
        "user": user
    }


graphql_app = GraphQLRouter(
    schema,
    path="/graphql",
    graphiql=True,
    context_getter=get_context
)

app.include_router(graphql_app, prefix="")


@app.get("/")
def root():
    return {"message": "GraphQL gateway running. Query at /graphql"}