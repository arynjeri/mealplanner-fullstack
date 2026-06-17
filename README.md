
# Internship Tasks — Simple Summary

This repository contains a full-stack application with completed tasks for both backend and frontend levels.

## Completed tasks

### Backend
- Setup Node.js and Express API with `backend/package.json` scripts
- Connect to MongoDB using Mongoose in `backend/src/config/db.js`
- Implement authentication with signup and login
- Hash passwords with `bcrypt` and issue JWT tokens
- Protect routes with middleware in `backend/src/middleware/authMiddleware.js`
- Add models for users, recipes, and meal plans in `backend/src/models/`
- Handle meal planner and recipe CRUD operations in controllers
- Validate requests and manage errors cleanly

### Frontend
- Build a React app with Vite in `frontend/`
- Add reusable UI components in `frontend/src/components/`
- Implement auth state and login flow in `frontend/src/context/AuthContext.jsx`
- Display recipes and meal planner features in `frontend/src/features/`
- Connect to the backend API through service functions
- Show notifications and loading states for user actions

## How to run locally

1. Backend
```bash
cd backend
npm install
npm run dev
```

2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Create a `.env` file in `backend/` with:
```
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<strong-jwt-secret>
PORT=5000
CLIENT_URL=http://localhost:5000
```

## Main endpoints
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/recipes` 
- `POST /api/recipes` (protected)
- `GET /api/meal-plans`
- `POST /api/meal-plans` (protected)

## Project structure
- `backend/` — API server, controllers, middleware, models
- `frontend/` — React app, components, auth context, feature screens

## Notes
- Backend uses JWT and bcrypt for security
- Frontend uses React and context for auth state
- The app is designed to complete the core internship tasks simply and clearly
