const express = require('express');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');
const HttpError = require('../utils/httpError');
const { ok } = require('../utils/respond');
const { validateReviewInput } = require('../utils/validate');

const router = express.Router();

// The exact object shape the frontend uses (no ownerId / _id).
const toReview = (d) => ({
  rid: d.rid, name: d.name, cuisine: d.cuisine, borough: d.borough, rating: d.rating, text: d.text, ts: d.ts,
});

/* GET /api/reviews -> this browser's reviews, newest first */
router.get('/', async (req, res) => {
  const docs = await Review.find({ ownerId: req.ownerId }).sort({ ts: -1, _id: -1 }).lean();
  ok(res, docs.map(toReview));
});

/* PUT /api/reviews/:id -> add, or replace this browser's one review for that restaurant */
router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const restaurant = await Restaurant.findOne({ restaurant_id: id }).lean();
  if (!restaurant) throw new HttpError(404, `Restaurant "${id}" was not found, so it cannot be reviewed.`);

  const review = validateReviewInput(req.body, id, restaurant);
  const saved = await Review.findOneAndUpdate(
    { ownerId: req.ownerId, rid: id },
    { $set: review },
    { upsert: true, returnDocument: 'after', runValidators: true }
  ).lean();
  ok(res, toReview(saved));
});

/* DELETE /api/reviews/:id -> remove this browser's review for that restaurant (idempotent) */
router.delete('/:id', async (req, res) => {
  await Review.deleteOne({ ownerId: req.ownerId, rid: req.params.id });
  ok(res, null);
});

module.exports = router;
