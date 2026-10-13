const express = require('express');
const Restaurant = require('../models/Restaurant');
const Favorite = require('../models/Favorite');
const HttpError = require('../utils/httpError');
const { ok } = require('../utils/respond');

const router = express.Router();

async function listFavorites(ownerId) {
  const docs = await Favorite.find({ ownerId }).sort({ createdAt: -1, _id: -1 }).lean();
  return docs.map((d) => d.restaurant_id);
}

router.get('/', async (req, res) => {
  ok(res, await listFavorites(req.ownerId));
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  if (!(await Restaurant.exists({ restaurant_id: id }))) {
    throw new HttpError(404, `Restaurant "${id}" was not found, so it cannot be a favorite.`);
  }
  try {
    await Favorite.updateOne(
      { ownerId: req.ownerId, restaurant_id: id },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    if (err.code !== 11000) throw err; 
  }
  ok(res, await listFavorites(req.ownerId));
});

router.delete('/:id', async (req, res) => {
  await Favorite.deleteOne({ ownerId: req.ownerId, restaurant_id: req.params.id });
  ok(res, await listFavorites(req.ownerId));
});

module.exports = router;
