# Dishcovery
Final Project Requirement for AddBase

Dishcovery is a restaurant discovery web app. Visitors can browse a catalogue of restaurants, search by name or cuisine, filter by borough, see which restaurants have the highest aggregated inspection scores, and save their own favorites and reviews.

The project is split into two parts that talk to each other over a JSON REST API:

- **Backend**: a Node.js / Express API backed by MongoDB (via Mongoose). It stores the restaurant dataset, runs the MongoDB aggregations that calculate scores, and persists each visitor's favorites and reviews.
- **Frontend**: a Vue 3 single-page app built with Vite. It handles the UI and talks to the backend only through one data-access module (`src/api.js`). In API mode it never reads the dataset or the database directly.

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [MongoDB Query Design](#mongodb-query-design)
5. [API Overview](#api-overview)
6. [Local Development](#local-development)
7. [Project Structure](#project-structure)
8. [Security Notes](#security-notes)

---

## Features

- Browse the full restaurant catalogue, split into pages, with cuisine-based photos
- Search restaurants by name, cuisine, borough, or address text
- Filter by borough
- Restaurant detail view
- **Score results**: restaurants whose aggregated score (the sum of all `grades[].score` values) is strictly greater than 90, calculated by a MongoDB aggregation
- **Favorites**: add and remove favorite restaurants
- **Reviews**: add, edit, and delete one review per restaurant (rating 1 to 5, text up to 600 characters)
- No login required: each browser gets a persistent anonymous ID, so favorites and reviews stay separate per visitor and survive refreshes and server restarts
- Idempotent data import: re-running the seed never creates duplicate restaurants
- Consistent response format: `{ "data": ... }` on success, `{ "error": { "message": "..." } }` on failure

---

## Technology Stack

### Frontend

| Area | Technology |
|---|---|
| Framework | Vue 3 |
| Routing | Vue Router 4 |
| Styling | Bootstrap 5 and custom CSS |
| Build tool / dev server | Vite 7 with `@vitejs/plugin-vue` |
| Data access | `fetch` through a single `src/api.js` module |
| Configuration | `VITE_DATA_SOURCE` and `VITE_API_URL` environment variables |
| Hosting | Vercel (static build with an `/api` rewrite to the backend) |

### Backend

| Area | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Data import | Custom seed script using `bson` EJSON |
| Config | `dotenv` |
| Cross-origin | `cors` (exact origin, credentials enabled) |
| Hosting | Render (Web Service) |

---

## Architecture

### System overview

```
Browser
   │
   ▼
Frontend (Vue SPA, served by Vercel)
   │   fetch("/api/...")  ── same-origin request, so the cookie stays first-party
   ▼
Vercel rewrite  /api/*  ───────────────►  Backend (Express on Render)
                                               │
                                               ▼
                                        MongoDB Atlas (dbRestaurants)
                                        ├── restaurants
                                        ├── favorites
                                        └── reviews
```

In local development the frontend calls the backend directly (`http://localhost:3000/api`), and the backend allows the frontend's exact origin (`http://localhost:5173`) through CORS.

### Backend

The backend is created by an app factory (`app.js`) and started by `server.js`.

1. `server.js` loads environment variables, connects to MongoDB, builds the unique indexes, warns if the restaurants collection is empty, then starts listening and handles graceful shutdown.
2. `app.js` configures CORS, JSON body parsing (100 kb limit), the routes, and the 404 and error handlers.
3. Requests to `/api/favorites` and `/api/reviews` pass through the `anonymousUser` middleware first, which attaches `req.ownerId`.

### Layer responsibilities

| Layer | Location | Responsibility |
|---|---|---|
| Entry point | `server.js` | Load env, connect DB, ensure indexes, start HTTP server, graceful shutdown |
| App factory | `app.js` | Middleware order, CORS, route mounting, error handling |
| Routes | `routes/` | Define endpoints, validate and sanitise request input, call the service layer or models, send responses |
| Services | `services/restaurantQueries.js` | The MongoDB aggregation pipelines for every restaurant response |
| Models | `models/` | Mongoose schemas for `Restaurant`, `Favorite`, `Review`, including indexes |
| Middleware | `middleware/` | Anonymous visitor identity (`anonymousUser`), `notFound` and `errorHandler` |
| Utilities | `utils/` | `respond` (the `{ data }` envelope), `httpError` (errors with a status code), `validate` (input validation) |
| Config | `config/constants.js` | Shared constants such as the default minimum score (90) |
| Database | `database/db.js` | MongoDB connection; forces the database name `dbRestaurants` |
| Scripts | `scripts/` | Seed script that imports `data/restaurants.json` |

### Frontend architecture

- **One data layer.** All reads and writes go through `src/api.js`. Components never call `fetch`, read dataset files, or touch `localStorage` directly.
- **Views and components.** Five routed views (`HomeView`, `RestaurantsView`, `FavoritesView`, `ReviewsView`, `AboutView`) are built from shared components (`Navbar`, `Footer`, `RestaurantCard`, `RestaurantListCard`, `RestaurantModal`).
- **Two data modes**, selected by `VITE_DATA_SOURCE`:
  - `local`: loads the supplied dataset from `public/data/restaurants.json` and keeps favorites and reviews in browser storage. This is a frontend preview only, with no MongoDB persistence.
  - `api`: uses the backend endpoints only, with no local fallback.
- **Response contract.** `api.js` unwraps `{ data }` envelopes and throws readable errors from `{ error: { message } }`. In API mode every restaurant must include a numeric `aggregatedScore` from the backend; the frontend does not calculate it.
- **Client-side browsing.** The restaurant list is loaded once. Searching, borough filtering, and page-by-page display happen in the browser on that list.
- **Routing.** Vue Router handles page navigation, so the host must fall back to `index.html` for unknown paths (configured in `vercel.json`).
- **Cookies.** Requests use `credentials: 'include'` so the browser sends the anonymous-ID cookie.
- **Photos.** One photo per restaurant is chosen from its cuisine's photo list using a stable hash of the restaurant ID, so a restaurant always shows the same photo.

---

## MongoDB Query Design

Database: `dbRestaurants`. Collections: `restaurants`, `favorites`, `reviews`.

### Restaurant filtering and pagination

**Filtering (backend).** The routes build one filter object from the query string. Each text parameter must be a single string of at most 100 characters; anything else returns a `400` error.

| Parameter | Match |
|---|---|
| `name` | Case-insensitive "contains" match |
| `cuisine` | Case-insensitive "contains" match |
| `borough` | Case-insensitive **exact** match (anchored `^...$`) |

User text is passed through `escapeRegex` before it becomes a regular expression, so special characters cannot alter the query.

```js
const filter = {};
if (name)    filter.name    = { $regex: escapeRegex(name),    $options: 'i' };
if (cuisine) filter.cuisine = { $regex: escapeRegex(cuisine), $options: 'i' };
if (borough) filter.borough = { $regex: `^${escapeRegex(borough)}$`, $options: 'i' };
```

The same filter powers `GET /restaurants` (filters optional), `GET /restaurants/search` (at least one filter required), and `GET /restaurants/borough/:boroughName`. Results come back in dataset order: the seed script creates ObjectIds in file order, so sorting by `_id` reproduces the original order.

**Pagination (frontend).** The API returns the matching restaurants in one response, and the Vue app divides them into pages in the browser. This keeps page switching instant and works because the dataset is small enough to load at once. If the dataset grows large, server-side pagination (`skip` and `limit` with a total count) can be added to the same pipeline without changing the response envelope.

### One pipeline for every restaurant response

Every restaurant response (list, detail, and score results) is built by a single reusable aggregation pipeline in `services/restaurantQueries.js`, so `aggregatedScore` is always present and always calculated by MongoDB:

```js
[
  { $match: match },                                            // optional: filter or restaurant_id
  { $addFields: { aggregatedScore: { $sum: '$grades.score' } } },
  { $match: { aggregatedScore: { $gt: minScore } } },           // optional: strictly greater than
  { $sort: byScore ? { aggregatedScore: -1, name: 1, _id: 1 }   // score results: highest first
                   : { _id: 1 } },                              // otherwise: dataset order
  { $project: { _id: 0 } }                                      // hide Mongo's internal _id
]
```

`$sum` ignores missing and non-numeric values, so a malformed grade entry cannot break the total, and a restaurant with no grades gets a score of `0`.

### Restaurant detail aggregation

`GET /restaurants/:id` runs the pipeline above with `$match: { restaurant_id: id }` and returns the single result. The record contains the original dataset fields (`address`, `grades`, `Meals`, `borough`, `cuisine`, `name`, `restaurant_id`) plus the numeric `aggregatedScore`. An unknown ID returns a `404` with a readable message.

### Score results and borough statistics

Two aggregation endpoints work on the summed scores. Both accept `minScore` (default 90) and reject non-numeric values with a `400`.

- `GET /restaurants/score-results`: a flat list of restaurants whose `aggregatedScore` is **strictly greater than** `minScore`, highest score first.
- `GET /restaurants/by-borough`: the same qualifying restaurants grouped by their actual borough, with a count per borough.

The grouping stage for `by-borough`:

```js
Restaurant.aggregate([
  { $addFields: { aggregatedScore: { $sum: '$grades.score' } } },
  { $match: { aggregatedScore: { $gt: minScore } } },
  { $group: { _id: '$borough', count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]);
```

It runs in parallel with the score-results query, and the two are combined into:

```json
[
  {
    "borough": "Brooklyn",
    "count": 12,
    "restaurants": [
      { "restaurant_id": "40573964", "name": "...", "cuisine": "...", "aggregatedScore": 97 }
    ]
  }
]
```

The `$gt` comparison is strict, matching the requirement that results must be greater than 90, not equal to it. The frontend double-checks this and rejects any score-results entry at or below the threshold.

### Favorites and reviews

- **Favorites** store one document per visitor and restaurant (`ownerId`, `restaurant_id`, `createdAt`). Adding uses an upsert with `$setOnInsert`, so re-adding is idempotent and never changes the original `createdAt`. A duplicate-key error from a simultaneous request is ignored. The API returns the visitor's updated list of restaurant IDs, newest first.
- **Reviews** are upserted per visitor and restaurant with `findOneAndUpdate`, so each visitor has at most one review per restaurant and editing replaces it. Each review stores a snapshot of the restaurant's `name`, `cuisine`, and `borough`, so the Reviews page needs no extra restaurant lookup.
- Both endpoints first check that the restaurant exists and return a `404` otherwise.

### Indexes

| Collection | Index | Purpose |
|---|---|---|
| `restaurants` | `{ restaurant_id: 1 }` **unique** | Fast lookups by ID; guarantees the seed can be re-run without duplicates |
| `restaurants` | `{ borough: 1 }` | Faster borough filtering and grouping |
| `favorites` | `{ ownerId: 1, restaurant_id: 1 }` **unique** | One favorite per visitor per restaurant; fast per-visitor listing |
| `reviews` | `{ ownerId: 1, rid: 1 }` **unique** | One review per visitor per restaurant; fast per-visitor listing |

The indexes are built at startup (`Model.init()`), and the seed script also builds the restaurant index before importing.

---

## API Overview

Base URL: `http://localhost:3000/api` locally, or `/api` on the deployed site (proxied to the backend).

**Success:** `{ "data": ... }` &nbsp;|&nbsp; **Failure:** `{ "error": { "message": "Readable explanation" } }` with an appropriate HTTP status.

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Service and database connection status |
| GET | `/restaurants` | List restaurants; optional `name`, `cuisine`, `borough` filters |
| GET | `/restaurants/search` | Same filters, but at least one is required |
| GET | `/restaurants/borough/:boroughName` | Restaurants in one borough |
| GET | `/restaurants/score-results?minScore=90` | Restaurants with `aggregatedScore` strictly greater than `minScore`, highest first |
| GET | `/restaurants/by-borough?minScore=90` | Qualifying restaurants grouped by borough, with counts |
| GET | `/restaurants/:id` | One restaurant by string `restaurant_id`, including `aggregatedScore` |
| GET | `/favorites` | The current visitor's favorite restaurant IDs (newest first) |
| PUT | `/favorites/:id` | Add a favorite (idempotent); returns the updated ID list |
| DELETE | `/favorites/:id` | Remove a favorite; returns the updated ID list |
| GET | `/reviews` | The current visitor's reviews (newest first) |
| PUT | `/reviews/:id` | Add or edit the review for a restaurant (rating 1 to 5, text 1 to 600 characters); returns the saved review |
| DELETE | `/reviews/:id` | Delete the review for a restaurant; returns `{ "data": null }` |

Favorites and reviews are scoped to the visitor identified by the `dishcovery_uid` cookie. Review objects have the shape `{ rid, name, cuisine, borough, rating, text, ts }`.

---

## Local Development

### Prerequisites

- Node.js 20.19 or newer (required by Vite 7) and npm
- A MongoDB Atlas cluster (or a local MongoDB instance) and its connection string
- In Atlas, your IP address added under **Network Access**
- Git

### Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```dotenv
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=dbRestaurants
PORT=3000
CLIENT_ORIGIN=http://localhost:5173

# Optional
# USE_PUBLIC_DNS=false        # set to false if your network resolves Atlas without public DNS

# Production only (HTTPS)
# COOKIE_SAMESITE=lax
# COOKIE_SECURE=true
```

If your database password contains special characters (`@`, `#`, `/`, ...), URL-encode them in the connection string.

### Seed data

Place the dataset at `backend/data/restaurants.json`, then run:

```bash
npm run seed              # inserts missing restaurants; existing ones are left untouched
npm run seed:overwrite    # also resets existing restaurants to the values in the file
npm run seed -- --file=path/to/other.json   # import a different file
```

Records are matched on the string `restaurant_id`, so running the seed again never creates duplicates. The seed does **not** delete restaurants that are missing from the file. To fully replace the data, clear the `restaurants` collection in Atlas first.

### Run the application

Use two terminals.

```bash
# Terminal 1: backend  ->  http://localhost:3000/api
cd backend
npm start
```

```bash
# Terminal 2: frontend  ->  http://localhost:5173
cd frontend
npm install
cp .env.example .env
npm run dev
```

`frontend/.env`:

```dotenv
# local: supplied dataset and browser storage. api: documented backend endpoints, no local fallback.
VITE_DATA_SOURCE=api
VITE_API_URL=http://localhost:3000/api
```

Vite reads `.env` only at startup, so restart `npm run dev` after changing it.

### Verification

1. Open `http://localhost:3000/api/health`. It should return `{ "data": { "status": "ok", "database": "connected" } }`.
2. Open `http://localhost:3000/api/restaurants`. It should return `{ "data": [ ... ] }` where every restaurant has a numeric `aggregatedScore`.
3. Open `http://localhost:3000/api/restaurants/score-results`. Every `aggregatedScore` should be greater than 90.
4. Open `http://localhost:3000/api/restaurants/by-borough`. Each borough should list its qualifying restaurants and a count.
5. Open `http://localhost:5173`. Restaurants and score results should load.
6. Search, filter by borough, and move between pages.
7. Favorite a restaurant and add a review. Check that a `dishcovery_uid` cookie exists and that documents appear in the `favorites` and `reviews` collections with the same `ownerId`.
8. Refresh the page and restart the backend. Favorites and reviews should still be there.
9. Open a private/incognito window. It should start with empty favorites and reviews.

---

## Project Structure

```
dishcovery/
├── backend/
│   ├── config/
│   │   └── constants.js
│   ├── data/
│   │   └── restaurants.json
│   ├── database/
│   │   └── db.js
│   ├── middleware/
│   │   ├── anonymousUser.js
│   │   └── errorHandlers.js
│   ├── models/
│   │   ├── Favorite.js
│   │   ├── Restaurant.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── favoriteRoutes.js
│   │   ├── restaurantRoutes.js
│   │   └── reviewRoutes.js
│   ├── scripts/
│   │   └── seed.js
│   ├── services/
│   │   └── restaurantQueries.js
│   ├── utils/
│   ├── .env.example
│   ├── .gitignore
│   ├── README.md
│   ├── app.js
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   ├── data/
│   │   │   ├── restaurants-data.js
│   │   │   └── restaurants.json
│   │   ├── img/
│   │   └── video/
│   ├── src/
│   │   ├── assets/css/
│   │   │   ├── about.css
│   │   │   ├── compatibility.css
│   │   │   ├── extras.css
│   │   │   ├── restaurants.css
│   │   │   └── style.css
│   │   ├── behaviors/
│   │   │   └── smoothScroll.js
│   │   ├── components/
│   │   │   ├── Footer.vue
│   │   │   ├── Navbar.vue
│   │   │   ├── RestaurantCard.vue
│   │   │   ├── RestaurantListCard.vue
│   │   │   └── RestaurantModal.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── views/
│   │   │   ├── AboutView.vue
│   │   │   ├── FavoritesView.vue
│   │   │   ├── HomeView.vue
│   │   │   ├── RestaurantsView.vue
│   │   │   └── ReviewsView.vue
│   │   ├── App.vue
│   │   ├── api.js
│   │   ├── cuisineDescriptions.js
│   │   ├── homePicks.js
│   │   └── main.js
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vercel.json
│   └── vite.config.js
└── README.md
```

---

## Security Notes

- **Secrets stay on the server.** The MongoDB URI lives only in `backend/.env` locally and in the hosting dashboard (Render) in production. `.env` files are gitignored; only `.env.example` files with placeholder values are committed.
- **Frontend variables are public.** Anything prefixed with `VITE_` is embedded in the built JavaScript and visible to every visitor. Only non-sensitive values (`VITE_DATA_SOURCE`, `VITE_API_URL`) belong there.
- **Rotate leaked credentials.** If a `.env` file or database password was ever committed or shared, rotate the Atlas password.
- **CORS is restricted** to the exact frontend origin(s) in `CLIENT_ORIGIN`, with credentials enabled for the cookie. No wildcard origin is used.
- **Anonymous identity.** The visitor ID is a random UUID v4 stored in an `httpOnly` cookie (`dishcovery_uid`, `SameSite=Lax`, two-year lifetime, `Secure` in production). The server validates the cookie format and replaces anything tampered with. Because the frontend reaches the API through a same-origin `/api` proxy, the cookie is first-party and not blocked as a third-party cookie.
- **This is not authentication.** The ID separates visitors' data but does not prove who they are. Clearing cookies or switching browsers starts a fresh identity.
- **Input validation.** Query parameters are checked (single text value, 100 characters maximum, numeric `minScore`), reviews are validated server-side (rating 1 to 5, text 1 to 600 characters, restaurant must exist), JSON bodies are limited to 100 kb, and search terms are escaped before use in regular expressions, which prevents regex injection.
- **Query safety.** Favorites and reviews are always filtered by the server-assigned `ownerId`, never by a value from the request, so one visitor cannot read or change another visitor's records.
- **Consistent errors.** Errors return the `{ error: { message } }` envelope without stack traces, and the `X-Powered-By` header is disabled.
- **Proxy awareness.** `trust proxy` is enabled so `Secure` cookies work behind the hosting provider's proxy.
- **Database network access.** Atlas Network Access is set to `0.0.0.0/0` because the hosting provider's IP addresses change. This makes a strong database password essential; use a dedicated database user with access limited to `dbRestaurants`.
