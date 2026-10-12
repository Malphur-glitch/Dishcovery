const express = require('express');
const Restaurant = require('../models/Restaurant');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');
const HttpError = require('../utils/httpError');
const { ok } = require('../utils/respond');
const { validateRestaurantInput } = require('../utils/validate');
const { DEFAULT_MIN_SCORE } = require('../config/constants');
const {
  escapeRegex, listRestaurants, findRestaurant, scoreResults, groupByBorough,
} = require('../services/restaurantQueries');

const router = express.Router();

// Reads one optional text query parameter (rejects repeated/object values such as ?name=a&name=b).
function queryText(query, key) {
  const v = query[key];
  if (v === undefined) return '';
  if (typeof v !== 'string') throw new HttpError(400, `"${key}" must be a single text value.`);
  const t = v.trim();
  if (t.length > 100) throw new HttpError(400, `"${key}" must be 100 characters or fewer.`);
  return t;
}

function queryMinScore(query) {
  if (query.minScore === undefined) return DEFAULT_MIN_SCORE;
  const n = typeof query.minScore === 'string' && query.minScore.trim() !== '' ? Number(query.minScore) : NaN;
  if (!Number.isFinite(n)) throw new HttpError(400, 'minScore must be a finite number.');
  return n;
}

// name/cuisine = case-insensitive partial match; borough = case-insensitive exact match.
function buildFilter(query) {
  const name = queryText(query, 'name');
  const cuisine = queryText(query, 'cuisine');
  const borough = queryText(query, 'borough');
  const filter = {};
  if (name) filter.name = { $regex: escapeRegex(name), $options: 'i' };
  if (cuisine) filter.cuisine = { $regex: escapeRegex(cuisine), $options: 'i' };
  if (borough) filter.borough = { $regex: `^${escapeRegex(borough)}$`, $options: 'i' };
  return Object.keys(filter).length ? filter : undefined;
}

/* GET /api/restaurants            -> every record (dataset order). Optional ?borough= ?name= ?cuisine= filters */
router.get('/', async (req, res) => {
  ok(res, await listRestaurants(buildFilter(req.query)));
});

/* GET /api/restaurants/search?name=&cuisine=&borough=  (at least one) */
router.get('/search', async (req, res) => {
  const filter = buildFilter(req.query);
  if (!filter) throw new HttpError(400, 'Provide at least one of: name, cuisine, borough.');
  ok(res, await listRestaurants(filter));
});

/* GET /api/restaurants/borough/:boroughName */
router.get('/borough/:boroughName', async (req, res) => {
  const filter = buildFilter({ borough: req.params.boroughName });
  if (!filter) throw new HttpError(400, 'Borough name is required.');
  ok(res, await listRestaurants(filter));
});

/* GET /api/restaurants/score-results?minScore=90 -> aggregatedScore strictly greater than minScore */
router.get('/score-results', async (req, res) => {
  ok(res, await scoreResults(queryMinScore(req.query)));
});

/* GET /api/restaurants/by-borough?minScore=90 -> the same score results grouped by borough */
router.get('/by-borough', async (req, res) => {
  ok(res, await groupByBorough(queryMinScore(req.query)));
});

/* POST /api/restaurants -> add */
router.post('/', async (req, res) => {
  const input = validateRestaurantInput(req.body, { create: true });
  input.restaurant_id = input.restaurant_id || `${Date.now()}`;

  if (await Restaurant.exists({ restaurant_id: input.restaurant_id })) {
    throw new HttpError(409, `A restaurant with restaurant_id "${input.restaurant_id}" already exists.`);
  }
  await Restaurant.create(input);
  ok(res, await findRestaurant(input.restaurant_id), 201);
});

/* GET /api/restaurants/:id */
router.get('/:id', async (req, res) => {
  const record = await findRestaurant(req.params.id);
  if (!record) throw new HttpError(404, `Restaurant "${req.params.id}" was not found.`);
  ok(res, record);
});

/* PUT or PATCH /api/restaurants/:id -> edit. Send only the fields to change; restaurant_id cannot change.
   (address and grades, when sent, replace the whole old value.) */
const editRestaurant = async (req, res) => {
  const id = req.params.id;
  const changes = validateRestaurantInput(req.body, { create: false });
  if (changes.restaurant_id !== undefined && changes.restaurant_id !== id) {
    throw new HttpError(400, 'restaurant_id cannot be changed.');
  }
  delete changes.restaurant_id;
  if (Object.keys(changes).length === 0) {
    throw new HttpError(400, 'Send at least one field to change: name, cuisine, borough, address, grades or Meals.');
  }

  const result = await Restaurant.updateOne({ restaurant_id: id }, { $set: changes }, { runValidators: true });
  if (result.matchedCount === 0) throw new HttpError(404, `Restaurant "${id}" was not found.`);
  ok(res, await findRestaurant(id));
};
router.put('/:id', editRestaurant);
router.patch('/:id', editRestaurant);

/* DELETE /api/restaurants/:id -> also removes that restaurant's favorites and reviews */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  const result = await Restaurant.deleteOne({ restaurant_id: id });
  if (result.deletedCount === 0) throw new HttpError(404, `Restaurant "${id}" was not found.`);
  await Promise.all([Favorite.deleteMany({ restaurant_id: id }), Review.deleteMany({ rid: id })]);
  ok(res, { restaurant_id: id, deleted: true });
});

module.exports = router;
