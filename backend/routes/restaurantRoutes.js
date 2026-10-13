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

router.get('/', async (req, res) => {
  ok(res, await listRestaurants(buildFilter(req.query)));
});

router.get('/search', async (req, res) => {
  const filter = buildFilter(req.query);
  if (!filter) throw new HttpError(400, 'Provide at least one of: name, cuisine, borough.');
  ok(res, await listRestaurants(filter));
});

router.get('/borough/:boroughName', async (req, res) => {
  const filter = buildFilter({ borough: req.params.boroughName });
  if (!filter) throw new HttpError(400, 'Borough name is required.');
  ok(res, await listRestaurants(filter));
});

router.get('/score-results', async (req, res) => {
  ok(res, await scoreResults(queryMinScore(req.query)));
});

router.get('/by-borough', async (req, res) => {
  ok(res, await groupByBorough(queryMinScore(req.query)));
});

router.get('/:id', async (req, res) => {
  const record = await findRestaurant(req.params.id);
  if (!record) throw new HttpError(404, `Restaurant "${req.params.id}" was not found.`);
  ok(res, record);
});



module.exports = router;
