const HttpError = require('./httpError');
const { BOROUGHS, MAX_REVIEW_LENGTH } = require('../config/constants');

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const fail = (errors) => {
  throw new HttpError(400, errors.join(' '));
};

// Trimmed text with a length range; pushes a readable message and returns null when invalid.
function cleanText(value, label, max, errors) {
  if (typeof value !== 'string') {
    errors.push(`${label} must be text.`);
    return null;
  }
  const t = value.trim();
  if (!t) {
    errors.push(`${label} cannot be empty.`);
    return null;
  }
  if (t.length > max) {
    errors.push(`${label} must be ${max} characters or fewer.`);
    return null;
  }
  return t;
}

function parseDate(value) {
  if (isPlainObject(value) && value.$date !== undefined) value = value.$date; // dataset style
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

/**
 * Validate a restaurant body. Only known fields are kept; everything else is dropped.
 * create=true  -> name, cuisine and borough are required.
 * create=false -> every field is optional (edit), but at least one must be present.
 */
function validateRestaurantInput(body, { create }) {
  if (!isPlainObject(body)) fail(['The request body must be a JSON object.']);
  const errors = [];
  const out = {};
  const has = (k) => body[k] !== undefined;

  for (const [key, max] of [['name', 120], ['cuisine', 60]]) {
    if (has(key)) {
      const v = cleanText(body[key], key, max, errors);
      if (v !== null) out[key] = v;
    } else if (create) errors.push(`${key} is required.`);
  }

  if (has('borough')) {
    const match =
      typeof body.borough === 'string' &&
      BOROUGHS.find((b) => b.toLowerCase() === body.borough.trim().toLowerCase());
    if (match) out.borough = match;
    else errors.push(`borough must be one of: ${BOROUGHS.join(', ')}.`);
  } else if (create) errors.push('borough is required.');

  if (has('restaurant_id')) {
    const raw = body.restaurant_id;
    const id = typeof raw === 'string' || typeof raw === 'number' ? String(raw).trim() : '';
    if (/^[A-Za-z0-9_-]{1,40}$/.test(id)) out.restaurant_id = id;
    else errors.push('restaurant_id may only contain letters, numbers, "-" and "_" (max 40 characters).');
  }

  if (has('address')) {
    const a = body.address;
    if (!isPlainObject(a)) errors.push('address must be an object.');
    else {
      const address = {};
      for (const [key, max] of [['building', 20], ['street', 120], ['zipcode', 10]]) {
        if (a[key] === undefined) continue;
        const v = cleanText(typeof a[key] === 'number' ? String(a[key]) : a[key], `address.${key}`, max, errors);
        if (v !== null) address[key] = v;
      }
      if (a.coord !== undefined) {
        const [lng, lat] = Array.isArray(a.coord) ? a.coord : [];
        const valid =
          Array.isArray(a.coord) && a.coord.length === 2 &&
          Number.isFinite(lng) && Number.isFinite(lat) &&
          Math.abs(lng) <= 180 && Math.abs(lat) <= 90;
        if (valid) address.coord = [lng, lat];
        else errors.push('address.coord must be [longitude, latitude] numbers.');
      }
      out.address = address;
    }
  }

  if (has('grades')) {
    if (!Array.isArray(body.grades) || body.grades.length > 100) {
      errors.push('grades must be an array of at most 100 items.');
    } else {
      out.grades = [];
      body.grades.forEach((g, i) => {
        const label = `grades[${i}]`;
        if (!isPlainObject(g)) return errors.push(`${label} must be an object.`);
        const date = parseDate(g.date);
        const grade = cleanText(g.grade, `${label}.grade`, 3, errors);
        const okScore = typeof g.score === 'number' && Number.isFinite(g.score) && g.score >= 0;
        if (!date) errors.push(`${label}.date must be a valid date.`);
        if (!okScore) errors.push(`${label}.score must be a number of 0 or more.`);
        if (date && grade !== null && okScore) out.grades.push({ date, grade, score: g.score });
      });
    }
  }

  if (has('Meals')) {
    if (!Array.isArray(body.Meals) || body.Meals.length > 30) {
      errors.push('Meals must be an array of at most 30 dish names.');
    } else {
      out.Meals = [];
      body.Meals.forEach((m, i) => {
        const v = cleanText(m, `Meals[${i}]`, 80, errors);
        if (v !== null) out.Meals.push(v);
      });
    }
  }

  if (errors.length) fail(errors);
  if (!create && Object.keys(out).length === 0) {
    fail(['Send at least one field to change: name, cuisine, borough, address, grades or Meals.']);
  }
  return out;
}

/**
 * Validate a review body for PUT /reviews/:id. `restaurant` is the matching restaurant record,
 * used to fill name/cuisine/borough when the client leaves them out.
 */
function validateReviewInput(body, id, restaurant) {
  if (!isPlainObject(body)) fail(['The request body must be a JSON object.']);
  const errors = [];

  if (body.rid !== undefined && String(body.rid) !== id) {
    errors.push('The review rid must match the restaurant id in the URL.');
  }

  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    errors.push('rating must be a whole number from 1 to 5.');
  }

  let text = null;
  if (typeof body.text !== 'string') errors.push('text must be text.');
  else {
    text = body.text.trim();
    if (!text) errors.push('text cannot be empty.');
    else if (text.length > MAX_REVIEW_LENGTH) errors.push(`text must be ${MAX_REVIEW_LENGTH} characters or fewer.`);
  }

  let ts = Date.now();
  if (body.ts !== undefined) {
    const valid = Number.isInteger(body.ts) && body.ts > 0 && body.ts <= Date.now() + 24 * 60 * 60 * 1000;
    if (valid) ts = body.ts;
    else errors.push('ts must be a valid timestamp in milliseconds.');
  }

  const labels = {};
  for (const key of ['name', 'cuisine', 'borough']) {
    labels[key] = body[key] === undefined ? restaurant[key] : cleanText(body[key], key, 120, errors);
  }

  if (errors.length) fail(errors);
  return { rid: id, ...labels, rating: body.rating, text, ts };
}

module.exports = { validateRestaurantInput, validateReviewInput, isPlainObject };
