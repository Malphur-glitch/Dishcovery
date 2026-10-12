# Dishcovery backend

Node.js + Express + MongoDB (Mongoose) API for the Dishcovery frontend. Database: **`dbRestaurants`**.

## 1. Setup (one time)

```bash
cd backend
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Open `backend/.env` and paste your MongoDB connection string into `MONGODB_URI`
(Atlas: *Connect → Drivers*, replace `<password>`; or `mongodb://127.0.0.1:27017` for a local MongoDB).
The code always uses the database `dbRestaurants`, whatever name the URI ends with.

Atlas checklist: the database user exists, and **Network Access** allows your IP address.

## 2. Import the dataset (one time)

```bash
npm run seed
```

Loads `data/restaurants.json` (3,772 restaurants, including `address`, `grades`, `Meals` and the string
`restaurant_id`). It is safe to run again: restaurants are matched on `restaurant_id`, so nothing is duplicated.
By default existing restaurants are left untouched. `npm run seed:overwrite` resets them to the file's values
(this also adds `Meals` if you imported an older file earlier).

## 3. Run

```bash
npm run dev      # auto-restarts on changes (or: npm start)
```

The API is at `http://localhost:3000/api`. Quick check: open `http://localhost:3000/api/health`.

## 4. Connect the frontend

In `frontend/.env`:

```
VITE_DATA_SOURCE=api
VITE_API_URL=http://localhost:3000/api
```

Restart `npm run dev` in the frontend (Vite only reads `.env` at startup).

**One frontend change is required.** Favorites and reviews are kept per browser using a cookie, and browsers only
send/store cookies on requests to another address (5173 -> 3000) when the request asks for it. In
`frontend/src/api.js`, inside `request()`, add `credentials: 'include'`:

```js
const response = await fetch(apiURL + path, {
  method, headers: { 'Content-Type': 'application/json' },
  credentials: 'include',                       // <-- add this line
  ...(body === undefined ? {} : { body: JSON.stringify(body) })
});
```

Without it the API still works, but every request looks like a brand-new visitor, so favorites and reviews will
not stick after a refresh. Whoever owns the frontend should make this change (it is not a design change).

`CLIENT_ORIGIN` in `backend/.env` must match the frontend's address exactly (`http://localhost:5173`, no trailing slash).
If Vite starts on another port, change it there.

## 5. API

All paths start with `/api`. Success: `{ "data": ... }`. Failure: `{ "error": { "message": "..." } }` with a 4xx/5xx status.
Restaurant ids are the dataset's `restaurant_id` strings. Every restaurant response includes a numeric `aggregatedScore`
(sum of all numeric `grades[].score`, calculated by MongoDB).

| Method & path | What it does |
| --- | --- |
| `GET /restaurants` | All restaurants in dataset order. Optional `?borough=` `?cuisine=` `?name=` |
| `GET /restaurants/search?name=&cuisine=&borough=` | Case-insensitive partial name/cuisine search (at least one term) |
| `GET /restaurants/borough/:name` | Restaurants in one borough (case-insensitive) |
| `GET /restaurants/score-results?minScore=90` | Restaurants with `aggregatedScore` **strictly greater** than `minScore` (default 90), highest first |
| `GET /restaurants/by-borough?minScore=90` | Those score results grouped by real borough: `[{ borough, count, restaurants }]` |
| `GET /restaurants/:id` | One restaurant (404 if missing) |
| `POST /restaurants` | Add. Required: `name`, `cuisine`, `borough` (one of the five NYC boroughs). Optional: `address`, `grades`, `Meals`, `restaurant_id` (generated if omitted) |
| `PUT` or `PATCH /restaurants/:id` | Edit. Send only the fields to change. `restaurant_id` cannot change |
| `DELETE /restaurants/:id` | Delete (also removes that restaurant's favorites and reviews) |
| `GET /favorites` | This browser's favorite ids, newest first |
| `PUT /favorites/:id` | Add a favorite (idempotent). Returns the full id array |
| `DELETE /favorites/:id` | Remove a favorite (idempotent). Returns the full id array |
| `GET /reviews` | This browser's reviews, newest first |
| `PUT /reviews/:id` | Add or replace this browser's one review for that restaurant |
| `DELETE /reviews/:id` | Remove it. Returns `{ "data": null }` |

Review body: `{ rid, name, cuisine, borough, rating (whole number 1-5), text (1-600 chars after trimming), ts (ms) }`.

The route order matters in Express: `/search`, `/borough/:name`, `/score-results` and `/by-borough` are declared before `/:id`.

## 6. Who is "this browser"?

There is no login. The first time a browser calls `/favorites` or `/reviews`, the server issues a random id in an
HTTP-only cookie (`dishcovery_uid`, valid for 2 years) and files that browser's favorites and reviews under it.
Another browser (or a private window) sees its own, separate records. Clearing cookies starts a fresh identity.
If you ever host the frontend and API on different sites, set `COOKIE_SAMESITE=none` and `COOKIE_SECURE=true` (HTTPS required).

## 7. Test

With the server running and the database seeded:

```bash
npm test
```

Runs about 80 checks (formats, validation, aggregation, CRUD, per-browser favorites/reviews, CORS). It adds one temporary
restaurant and deletes it again, so the dataset stays unchanged.

## 8. What changed from the earlier backend

- Port 3000 and base path `/api`, as the frontend expects. `{data}` / `{error:{message}}` response format everywhere.
- The list endpoints return **all** records (the frontend does its own paging and filtering), not 50 per page.
- `Meals` is now part of the model and the import (the old dataset copy did not have it).
- Import uses upserts instead of delete-and-reinsert; `restaurant_id` has a unique index.
- `/top-quality` became `/score-results`; added `/by-borough`, edit and delete, favorites and reviews.
- Fixed `startServer()` being called twice; removed `body-parser` (Express 5 has `express.json()`).
