/* DISHCOVERY | CENTRAL DATA ACCESS
   Favorites and reviews retain the original browser keys and array formats from shared.js.
   Every data operation is asynchronous; components never read dataset files or localStorage.
   Local mode is a frontend preview, not MongoDB persistence. API mode never falls back locally. */
const source = import.meta.env.VITE_DATA_SOURCE || 'local';
const apiURL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const FAV = 'dishcovery.favorites', REV = 'dishcovery.reviews';
const HUES = { Italian: 12, Japanese: 345, Mexican: 95, Indian: 32, Chinese: 5, Thai: 165 };
const photoLists = {
  "Italian": [
    "/img/italy-1.jpg",
    "/img/italy-2.jpg",
    "/img/italy-3.jpg",
    "/img/italy-4.jpg",
    "/img/italy-5.jpg",
    "/img/italy-6.jpg"
  ],
  "Japanese": [
    "/img/japan-1.jpg",
    "/img/japan-2.jpg",
    "/img/japan-3.jpg",
    "/img/japan-4.jpg",
    "/img/japan-5.jpg",
    "/img/japan-6.jpg"
  ],
  "Mexican": [
    "/img/mexico-1.jpg",
    "/img/mexico-2.jpg",
    "/img/mexico-3.jpg",
    "/img/mexico-4.jpg",
    "/img/mexico-5.jpg",
    "/img/mexico-6.jpg"
  ],
  "Indian": [
    "/img/india-1.jpg",
    "/img/india-2.jpg",
    "/img/india-3.jpg",
    "/img/india-4.jpg",
    "/img/india-5.jpg",
    "/img/india-6.jpg"
  ],
  "Chinese": [
    "/img/chinese-1.jpg",
    "/img/chinese-2.jpg",
    "/img/chinese-3.jpg",
    "/img/chinese-4.jpg",
    "/img/chinese-5.jpg",
    "/img/chinese-6.jpg"
  ],
  "Thai": [
    "/img/thai-1.jpg",
    "/img/thai-2.jpg",
    "/img/thai-3.jpg",
    "/img/thai-4.jpg",
    "/img/thai-5.jpg",
    "/img/thai-6.jpg"
  ]
};
  function titleCase(t) {
    return String(t).toLowerCase().replace(/(^|[\s\-\/])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
  }

  /* One record from the data file -> what the pages use.
     The score is the sum of all the scores in the record (aggregated score). */
  function prepare(raw, aggregatedScore) {
    var cuisine = titleCase(raw.cuisine || "");
    var score = aggregatedScore === undefined ? (raw.grades || []).reduce(function (s, g) { return s + (g.score || 0); }, 0) : aggregatedScore;
    var a = raw.address || {};
    var street = [a.building, a.street].filter(Boolean).join(" ").replace(/\s+/g, " ");
    var meals = raw.Meals || [];
    return {
      id: String(raw.restaurant_id),
      name: String(raw.name || "").replace(/'S\b/g, "'s"),
      cuisine: cuisine,
      borough: raw.borough || "",
      street: street,
      zip: a.zipcode || "",
      score: score,
      meals: meals,
      hue: HUES[cuisine] !== undefined ? HUES[cuisine] : 215,
      haystack: [raw.name, cuisine, raw.borough, street, a.zipcode, meals.join(" ")].join(" ").toLowerCase()
    };
  }


/* One photo per restaurant, always from its own cuisine.
   These are the original #cuisine-photos lists. The id hash preserves the same photo forever. */
function photo(r) {
  const list = photoLists[r.cuisine];
  if (!list?.length) return '';
  let h = 0;
  for (let i = 0; i < r.id.length; i++) h = (h * 31 + r.id.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}
function normalize(raw, fromAPI = false) {
  // In API mode the score must be calculated by the backend, not by this frontend.
  if (fromAPI && !Number.isFinite(raw.aggregatedScore)) throw new Error('API restaurant records must include aggregatedScore from the backend.');
  const r = prepare(raw, fromAPI ? raw.aggregatedScore : undefined);
  return { ...r, photo: photo(r) };
}
function mode() {
  if (!['local', 'api'].includes(source)) throw new Error('VITE_DATA_SOURCE must be local or api.');
  return source;
}
// Backend response envelope is { data: value }; failures are { error: { message } }.
async function request(path, method = 'GET', body) {
  if (!apiURL) throw new Error('Set VITE_API_URL before using API mode.');
  const response = await fetch(apiURL + path, {
    method, credentials: 'include', headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  const envelope = await response.json();
  if (!response.ok) throw new Error(envelope.error?.message || `Request failed (${response.status}).`);
  if (!Object.hasOwn(envelope, 'data')) throw new Error('API response must contain data.');
  return envelope.data;
}
let recordsPromise;
async function localRecords() {
  if (!recordsPromise) recordsPromise = fetch('/data/restaurants.json').then(async response => {
    if (!response.ok) throw new Error('The supplied restaurant dataset could not be loaded.');
    const records = await response.json();
    if (!Array.isArray(records)) throw new Error('Restaurant dataset must be an array.');
    return records;
  }).catch(error => { recordsPromise = null; throw error; });
  return recordsPromise;
}
export async function getRestaurants() {
  const records = mode() === 'api' ? await request('/restaurants') : await localRecords();
  if (!Array.isArray(records)) throw new Error('Restaurant response must be an array.');
  return records.map(raw => normalize(raw, source === 'api'));
}
// Only local mode previews summed scores. API mode requires the MongoDB aggregation endpoint.
export async function getScoreResults({ minScore = 90 } = {}) {
  if (mode() === 'local') return (await getRestaurants()).filter(r => r.score > minScore);
  const records = await request('/restaurants/score-results?minScore=' + encodeURIComponent(minScore));
  if (!Array.isArray(records)) throw new Error('Score-results response must be an array.');
  const normalized = records.map(raw => normalize(raw, true));
  if (normalized.some(r => r.score <= minScore)) throw new Error('Score-results endpoint must return scores strictly greater than minScore.');
  return normalized;
}
export async function getHomeData() {
  if (mode() === 'local') return { restaurants: await getRestaurants(), scoreResults: null };
  const [restaurants, scoreResults] = await Promise.all([getRestaurants(), getScoreResults()]);
  return { restaurants, scoreResults };
}
export async function getRestaurant(id) {
  if (mode() === 'api') return normalize(await request('/restaurants/' + encodeURIComponent(id)), true);
  return (await getRestaurants()).find(r => r.id === String(id)) || null;
}
// Invalid legacy storage reads keep the original empty-array behavior. Failed writes are surfaced.
function read(key) {
  try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { throw new Error('Your browser could not save this change. Check its storage settings.'); }
}
export async function getFavorites() { return mode() === 'api' ? request('/favorites') : read(FAV); }
export async function addFavorite(id) {
  id = String(id);
  if (mode() === 'api') return request('/favorites/' + encodeURIComponent(id), 'PUT');
  const favorites = read(FAV); if (!favorites.includes(id)) favorites.unshift(id);
  write(FAV, favorites); return favorites;
}
export async function removeFavorite(id) {
  id = String(id);
  if (mode() === 'api') return request('/favorites/' + encodeURIComponent(id), 'DELETE');
  const favorites = read(FAV).filter(saved => saved !== id); write(FAV, favorites); return favorites;
}
export async function getReviews() { return mode() === 'api' ? request('/reviews') : read(REV); }
export async function getReview(id) { return (await getReviews()).find(r => r.rid === String(id)) || null; }
// Add or edit (one review per restaurant), matching the original DX.reviews.save behavior.
export async function addReview(record) {
  const review = { ...record, rid: String(record.rid), rating: Number(record.rating), text: String(record.text).trim() };
  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) throw new Error('Pick a star rating first.');
  if (!review.text) throw new Error('Write a few words about your visit.');
  if (review.text.length > 600) throw new Error('Keep your review within 600 characters.');
  if (mode() === 'api') return request('/reviews/' + encodeURIComponent(review.rid), 'PUT', review);
  const reviews = read(REV).filter(old => old.rid !== review.rid); reviews.unshift(review); write(REV, reviews); return review;
}
export async function updateReview(id, changes) {
  const previous = await getReview(id);
  if (!previous) throw new Error('Review not found.');
  return addReview({ ...previous, ...changes, rid: String(id) });
}
export async function deleteReview(id) {
  if (mode() === 'api') return request('/reviews/' + encodeURIComponent(id), 'DELETE');
  write(REV, read(REV).filter(review => review.rid !== String(id))); return null;
}
// Pure original id/cuisine photo selection; Reviews needs no restaurant-dataset fetch.
export { photo as getRestaurantPhoto };
