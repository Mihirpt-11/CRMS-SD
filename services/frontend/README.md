# Frontend - Campus Resource Management System

React frontend for the Campus Resource Management System.

## Features

- Sign-in page with role-based authentication
- Student Dashboard with GraphQL integration
- Faculty Dashboard for handling service requests
- Admin Dashboard for system management
- JWT token-based authentication
- Real-time data updates

## Development

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Docker

The frontend is containerized and served via Nginx. See the main README for Docker setup instructions.

## Environment Variables

- `VITE_API_BASE_URL` - API base URL (leave empty for relative URLs via nginx)
- `VITE_GRAPHQL_URL` - GraphQL endpoint URL (default: `/graphql`)

