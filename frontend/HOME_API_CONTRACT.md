# Stage 3 — API contract used by Home

This is the minimal contract currently consumed by `src/api.js`. No backend code is included. The remaining restaurant CRUD, filters/grouping and final backend contract are deferred to Stage 5.

Use Node.js/Express/Mongoose with the `dbRestaurants` database. Set `VITE_DATA_SOURCE=api` and `VITE_API_URL` to your Express API base URL, including `/api` if used. Restart Vite after changing environment settings. Allow the frontend origin with CORS. API mode never silently falls back to local data.

## Shared response shape

Success: `{ "data": value }`. Error: `{ "error": { "message": "Readable explanation" } }` with an appropriate non-2xx HTTP status. JSON bodies and responses use `Content-Type: application/json`.

Identifiers in URLs are the dataset’s `restaurant_id` strings, not a MongoDB `_id`. Preserve the raw fields: `address` (building, coord, street, zipcode), `borough`, `cuisine`, `grades` (date, grade, score), `name`, `restaurant_id`, and `Meals`. Add the numeric `aggregatedScore` to restaurant responses. Keep `Meals` capitalized. The dataset uses New York boroughs, not Angeles barangays; no mapping has been applied.

`aggregatedScore` is the sum of all numeric `grades[].score` values. In API mode, the backend must calculate it with a MongoDB aggregation pipeline; the frontend uses that returned value. These inspection records are not customer-quality ratings. The original “Top Rated” display text has been retained for conversion parity pending review.

| Method and path | Purpose / query | Request body | Successful `data` |
| --- | --- | --- | --- |
| `GET /restaurants` | All restaurant records needed by Home; no query currently | None | Array of raw records including numeric `aggregatedScore` |
| `GET /restaurants/:id` | One restaurant by `restaurant_id` | None | Raw record including numeric `aggregatedScore`; 404 error if absent |
| `GET /restaurants/score-results?minScore=90` | Backend aggregation results with score strictly greater than numeric `minScore` | None | Array of raw restaurant records with numeric `aggregatedScore > minScore` |
| `GET /favorites` | Favorites for the current user/session scope | None | Array of string restaurant IDs, most recent first |
| `PUT /favorites/:id` | Idempotently add a favorite | None | Complete current favorites ID array |
| `DELETE /favorites/:id` | Idempotently remove a favorite | None | Complete current favorites ID array |
| `GET /reviews` | Reviews for the current user/session scope | None | Review array, most recent first |
| `PUT /reviews/:id` | Add or update the one review for this restaurant in the current scope | Review object below | Saved review object |
| `DELETE /reviews/:id` | Remove the review for this restaurant | None | `null` |

Register `/restaurants/score-results` before `/restaurants/:id` in Express to avoid interpreting `score-results` as an ID. Return full records in a stable dataset order for Home’s deterministic daily picks. Pagination is not yet supported by this checkpoint’s Home adapter.

Review object:

```json
{
  "rid": "30075445",
  "name": "Morris Park Bake Shop",
  "cuisine": "Thai",
  "borough": "Bronx",
  "rating": 4,
  "text": "Enjoyed our visit.",
  "ts": 1791741600000
}
```

Validate that the restaurant exists, that the review `rid` agrees with the URL, that `rating` is an integer from 1–5, that trimmed text has 1–600 characters, and that timestamps are valid milliseconds. Favorite IDs must identify existing restaurants. Score thresholds must be finite numbers; the default used by Home is 90 and comparison is strict `>`.

The backend team must decide and document user/session scoping for favorites and reviews. No frontend login or authentication design has been invented in this conversion. Do not share private user records across scopes. Full authentication/session integration is unverified.

## Local mode

Local mode fetches the supplied dataset from `public/data/restaurants.json` and previews the original summed-score selection in the browser. Favorites retain `dishcovery.favorites` as an array of string IDs. Reviews retain `dishcovery.reviews` as an array of the original review objects. No migration is required, and existing data on the same browser origin is preserved. A new host or port has a separate localStorage store.

Browser-local favorites/reviews and score previews do not satisfy MongoDB persistence or aggregation requirements. Restaurant record editing is not part of Stage 3.

## Validation boundary

Adapter response shapes, endpoint methods, backend score usage and failure behavior were tested using mocked responses. No real Express backend, Atlas connection, MongoDB pipeline or database persistence was tested.
