
# Full-Stack Development Capstone — Complete Implementation

This repository contains a complete full‑stack application implemented to satisfy the full set of requirements from the capstone tasks. The project demonstrates:

- a reproducible development environment (Node.js + npm, Git),
- a REST API with CRUD endpoints and proper error handling,
- a modern componentized frontend built with React,
- secure authentication and role-based authorization (bcrypt + JWT),
- persistent data storage via MongoDB and Mongoose models, and
- real-time features using Socket.io.

---

## Key accomplishments

- Development environment and scripts are present in `backend/package.json` and `frontend/package.json`.
- Express REST API with CRUD for core resources (users, recipes, meal plans).
- Authentication: signup/login, password hashing, JWT issuance and verification, and middleware-based route protection (`backend/src/middleware/authMiddleware.js`).
- Database models and validation in `backend/src/models/` (`User.js`, `Recipe.js`, `MealPlan.js`).
- React frontend with reusable components and context-based auth (`frontend/src/context/AuthContext.jsx`).
- Socket.io integration for real-time notifications and live updates.

---

## Tech stack

- Backend: Node.js, Express, Mongoose (MongoDB), bcrypt, jsonwebtoken, Socket.io
- Frontend: React (Vite), Context API, Fetch/axios
- Dev tools: npm, Git, Postman / Thunder Client

---

## Quick start (local)

1) Backend

```bash
cd backend
npm install
# create .env using the example or add the variables shown below
npm run dev
```

2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend (Vite) typically serves at `http://localhost:5173`. Backend API typically listens on `http://localhost:5000` (see `PORT`).

Environment variables (create `.env` in `backend/`):

```
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<strong-jwt-secret>
PORT=5000
CLIENT_URL=http://localhost:3000
```

---

## Example API endpoints

- `POST /api/auth/signup` — create account
- `POST /api/auth/login` — authenticate and receive JWT
- `GET /api/recipes` — list recipes
- `POST /api/recipes` — create recipe (protected)
- `GET /api/meal-plans` — list meal plans
- `POST /api/meal-plans` — create meal plan (protected)

See the route files in `backend/src/routes/` for full details and input validation.

---

## Authentication & security

- Passwords are hashed with `bcrypt` before storage.
- JWT tokens are issued on login and verified on protected routes; choose HTTP-only cookies for improved security or local storage for a simpler client flow.
- Role checks and protected endpoints are enforced in middleware under `backend/src/middleware/`.

---

## Real-time

- Socket.io is integrated on the backend and consumed by the React client for real-time notifications and updates.
- The server emits user-targeted events and the client subscribes to relevant channels.

---

## Project layout (quick)

- `backend/` — Express API and server
  - `server.js` — entrypoint
  - `src/config/db.js` — MongoDB connection
  - `src/controllers/` — handlers: auth, recipes, meal plans
  - `src/models/` — Mongoose schemas
  - `src/middleware/` — auth middleware, error handler, validators

- `frontend/` — React app (Vite)
  - `src/components/` — UI components
  - `src/context/AuthContext.jsx` — auth state and helpers
  - `src/features/` — recipe list, meal planner, etc.

---

## Testing & validation

- Use Postman or Thunder Client to exercise endpoints; include `Authorization: Bearer <token>` for protected routes.
- Backend validates input at the schema and controller levels and returns clear JSON error messages.

---

## Deployment notes

- Build the frontend with `npm run build` in `frontend` and serve statics from your preferred host or through the backend.
- Use a production MongoDB (Atlas or managed service), secure secrets, enable TLS, and configure CORS and cookie policies appropriately.

---

## Where to look (important files)

- Backend entry: `backend/server.js`
- DB config: `backend/src/config/db.js`
- Auth controller & routes: `backend/src/controllers/authController.js`, `backend/src/routes/authRoutes.js`
- Models: `backend/src/models/User.js`, `backend/src/models/Recipe.js`, `backend/src/models/MealPlan.js`
- Frontend root: `frontend/src` (components, context, features)

---
