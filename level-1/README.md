# Level 1 - Backend Development (Meal Planner API)

This project represents Level 1 of my backend development work. It demonstrates a complete development environment and a REST API built with Node.js, Express, and MongoDB to manage recipes and meal plans.

---

## What I implemented

- Development environment: Node.js, npm, VS Code, Git, MongoDB
- Express server with JSON parsing and routing (`src/server.js`)
- MongoDB connection via Mongoose (`src/config/db.js`)
- `Recipe` and `MealPlan` models (`src/models`)
- Full CRUD controllers and routes for recipes and meal plans (`src/controllers`, `src/routes`)
- Basic error handling and project structure (controllers, routes, models, middleware)

---

## How to run

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file with at least:

```
MONGO_URI=<your-mongodb-connection-string>
PORT=5000
```

3. Run in development

```bash
npm run dev
```

Server should log: `Server running on port 5000` and `MongoDB Connected successfully`.

---

## Resources implemented (quick links)

- Server: [src/server.js](src/server.js#L1)
- DB connection: [src/config/db.js](src/config/db.js#L1)
- Recipe model: [src/models/Recipe.js](src/models/Recipe.js#L1)
- MealPlan model: [src/models/MealPlan.js](src/models/MealPlan.js#L1)
- Recipe controller/routes: [src/controllers/recipeController.js](src/controllers/recipeController.js#L1), [src/routes/recipeRoutes.js](src/routes/recipeRoutes.js#L1)
- Meal controller/routes: [src/controllers/mealController.js](src/controllers/mealController.js#L1), [src/routes/mealRoutes.js](src/routes/mealRoutes.js#L1)

---

## API: Detailed CRUD guide & examples

Base URL: `http://localhost:<PORT>/api`

### Recipes (resource)

Model (see [src/models/Recipe.js](src/models/Recipe.js#L1))
- `name` (string, required)
- `tags` (string[], required)
- `ingredients` (string[], required)
- `instructions` (string, required)
- `image` (string, optional)

Endpoints

- POST `/api/recipes` — Create a recipe
  - Body (JSON): `{ name, tags: [], ingredients: [], instructions, image? }`
  - Returns: `201` and saved recipe object.
  - Errors: `400` for missing fields, `500` for server errors.

- GET `/api/recipes` — List all recipes
  - Returns: `200` and an array of recipes.

- GET `/api/recipes/:id` — Get single recipe
  - Returns: `200` and recipe object, or `404` if not found.

- PUT `/api/recipes/:id` — Update recipe
  - Body: same shape as create (fields will overwrite existing values)
  - Returns: `200` and updated recipe, or `404` if not found.

- DELETE `/api/recipes/:id` — Delete recipe
  - Returns: `200` with confirmation message or `404`.

Example create request (curl)

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"Pancakes","tags":["breakfast"],"ingredients":["flour","milk","egg"],"instructions":"Mix and fry"}' \
  http://localhost:5000/api/recipes
```

Sample response (201)

```json
{
  "_id": "646...",
  "name": "Pancakes",
  "tags": ["breakfast"],
  "ingredients": ["flour","milk","egg"],
  "instructions": "Mix and fry",
  "image": "",
  "__v": 0
}
```

---

### Meal plans (resource)

Model (see [src/models/MealPlan.js](src/models/MealPlan.js#L1))
- `date` (string, required, format `YYYY-MM-DD`, unique)
- `meals`: array of `{ slot: 'breakfast'|'lunch'|'dinner', recipe: [ObjectId], notes?: string }`

Endpoints & request shapes

- POST `/api/meals` — Create a meal slot (or create the day's document)
  - Body (JSON): `{ date: 'YYYY-MM-DD', slot: 'lunch', recipeIds: ['id1','id2'], notes?: '...' }`
  - Returns: `201` with saved MealPlan. `409` if slot already exists for that date.

- GET `/api/meals` — List meal plans (supports `startDate` & `endDate` query)

- GET `/api/meals/:date` — Get meal plan for a date

- GET `/api/meals/:date/slots/:slot` — Get specific slot

- PATCH `/api/meals/:date/slots/:slot` — Update a slot's recipeIds and/or notes
  - Body: `{ recipeIds: ['id1','id2'], notes?: '...' }`
  - Returns: `200` with updated MealPlan. `400` if invalid input.

- PUT `/api/meals/:date` — Replace the day's `meals` array
  - Body example: `{ meals: [{ slot: 'breakfast', recipe: ['id'], notes: '...' }] }`

- DELETE `/api/meals/:date` — Delete whole day's plan (204)

- DELETE `/api/meals/:date/slots/:slot` — Delete specific slot

Example create meal slot (curl)

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"date":"2026-05-22","slot":"dinner","recipeIds":["646..."],"notes":"Family meal"}' \
  http://localhost:5000/api/meals
```

Sample response (201)

```json
{
  "_id": "648...",
  "date": "2026-05-22",
  "meals": [
    {"slot":"dinner","recipe":[{"_id":"646...","name":"Pancakes"}],"notes":"Family meal"}
  ]
}
```

---

### Validation & common errors

- Ensure `MONGO_URI` is set before starting the server.
- `400 Bad Request`: invalid/missing body fields (e.g., `recipeIds` not an array).
- `404 Not Found`: resource not found (recipe, meal date, or slot).
- `409 Conflict`: attempting to create a slot that already exists on a date.
- `500 Internal Server Error`: unexpected server error.
---