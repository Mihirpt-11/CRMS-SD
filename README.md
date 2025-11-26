# Campus Resource Management System

A full-stack microservices application for managing campus resources, bookings, hostel allocations, and service requests.

## Architecture

- **Frontend**: React with Vite
- **Backend**: FastAPI microservices
- **Database**: MongoDB
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **API Gateway**: Nginx
- **GraphQL Gateway**: Strawberry GraphQL

## Services

1. **Auth Service** - User authentication and JWT token generation
2. **Booking Service** - Resource booking management
3. **Hostel Service** - Hostel room and allocation management
4. **Request Service** - Service request management
5. **GraphQL Gateway** - Aggregates data from all services
6. **Notification Service** - Handles RabbitMQ events
7. **Frontend** - React application

## Features

### Student Dashboard
- View bookings
- Create new bookings
- View hostel allocation
- Submit service requests
- Raise maintenance requests
- Track request status

### Faculty Dashboard
- View all service requests assigned to them
- Approve/Reject requests
- Real-time updates

### Admin Dashboard
- Add/Manage resources (classrooms, labs)
- Add/Manage hostel rooms
- View all service requests system-wide
- System overview

## Prerequisites

- Docker and Docker Compose installed
- At least 4GB RAM available
- Ports 80, 27017, 6379, 5672, 15672 available

## Quick Start

1. **Navigate to the infra directory:**
   ```bash
   cd "CRMS SD/infra"
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - RabbitMQ Management: http://localhost:15672 (guest/guest)

## Creating Users

You can create users via the signup endpoint or directly in MongoDB. To create a test user via API:

```bash
# Create a student
curl -X POST http://localhost/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "student1", "password": "password123", "role": "student"}'

# Create a faculty
curl -X POST http://localhost/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "faculty1", "password": "password123", "role": "faculty"}'

# Create an admin
curl -X POST http://localhost/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin1", "password": "password123", "role": "admin"}'
```

## Usage

1. **Sign In:**
   - Go to http://localhost
   - Enter username, password, and select your role
   - You'll be redirected to the appropriate dashboard

2. **Student Workflow:**
   - Create bookings for resources
   - Submit service requests (e.g., "Need Bonafide Certificate")
   - View hostel allocation
   - Raise maintenance requests

3. **Faculty Workflow:**
   - View service requests assigned to you
   - Approve or reject requests
   - Requests update in real-time

4. **Admin Workflow:**
   - Add resources (classrooms/labs)
   - Add hostel rooms
   - View all system requests
   - Monitor system status

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Booking
- `GET /booking/resource` - List all resources
- `POST /booking/resource` - Create resource (Admin)
- `POST /booking/create` - Create booking
- `GET /booking/student/{user_id}` - Get student bookings

### Request
- `POST /request/create` - Create service request
- `GET /request/student/{user_id}` - Get student requests
- `GET /request/faculty/{faculty_id}` - Get faculty requests
- `GET /request/all` - Get all requests (Admin)
- `PUT /request/update/{request_id}` - Update request status

### Hostel
- `GET /hostel/room` - List all rooms
- `POST /hostel/room` - Create room (Admin)
- `POST /hostel/allocate` - Allocate room
- `POST /hostel/maintenance` - Create maintenance request
- `GET /hostel/student/{user_id}` - Get student allocations

### GraphQL
- `POST /graphql` - GraphQL endpoint
  - Query: `studentDashboard(studentId: String!)`

## Development

### Running Services Individually

Each service can be run individually for development:

```bash
# Auth Service
cd services/auth
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Booking Service
cd services/booking
pip install -r requirements.txt
uvicorn main:app --reload --port 8002

# ... and so on
```

### Frontend Development

```bash
cd services/frontend
npm install
npm run dev
```

## Environment Variables

### Frontend
- `VITE_API_BASE_URL` - API base URL (default: empty for relative URLs)
- `VITE_GRAPHQL_URL` - GraphQL endpoint (default: `/graphql`)

### Backend Services
- `MONGODB_URL` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `RABBITMQ_URL` - RabbitMQ connection string
- `SECRET_KEY` - JWT secret key

## Troubleshooting

1. **Services not starting:**
   - Check if ports are available
   - Check Docker logs: `docker-compose logs [service-name]`

2. **Frontend not loading:**
   - Ensure nginx is running
   - Check browser console for errors
   - Verify API endpoints are accessible

3. **Authentication issues:**
   - Verify JWT secret key matches across services
   - Check token expiration (default: 6 hours)

4. **Database connection issues:**
   - Ensure MongoDB container is running
   - Check MONGODB_URL environment variable

## Stopping Services

```bash
docker-compose down
```

To remove volumes (clears database):
```bash
docker-compose down -v
```

## Project Structure

```
CRMS SD/
├── infra/
│   ├── docker-compose.yml
│   └── nginx/
│       └── nginx.conf
└── services/
    ├── auth/
    ├── booking/
    ├── graphql-gateway/
    ├── hostel/
    ├── notification/
    ├── request/
    └── frontend/
```

## Notes

- All services communicate via Docker network
- Frontend is served through Nginx reverse proxy
- JWT tokens include user role for authorization
- Real-time updates via polling (can be enhanced with WebSockets)
- GraphQL aggregates data from multiple microservices

