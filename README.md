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
