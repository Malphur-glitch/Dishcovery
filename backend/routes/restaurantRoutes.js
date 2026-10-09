const express = require('express');
const Restaurant = require('../models/Restaurant');

const router = express.Router();

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Read ?page= and ?limit= from the query string.
 * The collection holds ~25,000 documents, so list endpoints are paginated
 * to keep responses fast. Defaults: page 1, 50 per page (max 200).
 */
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 50, 1), 200);
  return { page, limit, skip: (page - 1) * limit };
};

/* =====================================================================
 * 1. GET /api/restaurants
 *    Fetch all restaurants (paginated).
 *    Example: /api/restaurants?page=2&limit=25
 * ===================================================================== */
router.get('/', async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [restaurants, total] = await Promise.all([
      Restaurant.find().sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Restaurant.countDocuments(),
    ]);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error('GET /api/restaurants error:', error);
    res.status(500).json({ message: 'Failed to fetch restaurants', error: error.message });
  }
});

/* =====================================================================
 * 2. GET /api/restaurants/search
 *    Dynamic, case-insensitive partial search by name and/or cuisine.
 *    Examples:
 *      /api/restaurants/search?name=morris
 *      /api/restaurants/search?cuisine=bakery
 *      /api/restaurants/search?name=park&cuisine=bakery   (both must match)
 * ===================================================================== */
router.get('/search', async (req, res) => {
  try {
    const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
    const cuisine = typeof req.query.cuisine === 'string' ? req.query.cuisine.trim() : '';

    // At least one search term is required
    if (!name && !cuisine) {
      return res.status(400).json({
        message: "Provide at least one query parameter: 'name' and/or 'cuisine'",
      });
    }

    // Build the filter dynamically: only add fields the user supplied
    const filter = {};
    if (name) filter.name = { $regex: escapeRegex(name), $options: 'i' };
    if (cuisine) filter.cuisine = { $regex: escapeRegex(cuisine), $options: 'i' };

    const { page, limit, skip } = getPagination(req.query);

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Restaurant.countDocuments(filter),
    ]);

    // An empty result is a valid search outcome, so this stays a 200
    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error('GET /api/restaurants/search error:', error);
    res.status(500).json({ message: 'Failed to search restaurants', error: error.message });
  }
});

/* =====================================================================
 * 3. GET /api/restaurants/borough/:boroughName
 *    Filter restaurants by borough (case-insensitive, exact match).
 *    Examples: /borough/Bronx   /borough/staten%20island
 * ===================================================================== */
router.get('/borough/:boroughName', async (req, res) => {
  try {
    const boroughName = req.params.boroughName.trim();

    if (!boroughName) {
      return res.status(400).json({ message: 'Borough name is required' });
    }

    // Anchored regex (^...$) = exact match, but case-insensitive
    const filter = { borough: { $regex: `^${escapeRegex(boroughName)}$`, $options: 'i' } };
    const { page, limit, skip } = getPagination(req.query);

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Restaurant.countDocuments(filter),
    ]);

    res.status(200).json({
      borough: boroughName,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error('GET /api/restaurants/borough error:', error);
    res.status(500).json({ message: 'Failed to filter by borough', error: error.message });
  }
});

/* =====================================================================
 * 4. GET /api/restaurants/top-quality
 *    Aggregation pipeline: restaurants whose total score is > 90.
 *
 *    Stages:
 *      $unwind  -> split each restaurant into one doc per grade entry
 *      $group   -> re-combine by restaurant, summing grades.score
 *      $match   -> keep only aggregatedScore > 90
 *      $sort    -> highest scores first
 *
 *    Note: we SUM the scores. Because every restaurant has several
 *    inspections, the sum reaches >90 for a meaningful subset, whereas an
 *    average would almost never exceed 90 in this dataset.
 * ===================================================================== */
router.get('/top-quality', async (req, res) => {
  try {
    const topRestaurants = await Restaurant.aggregate([
      // Stage 1: one document per grade entry
      { $unwind: '$grades' },

      // Stage 2: group back together by restaurant, summing every score
      {
        $group: {
          _id: '$_id',
          restaurant_id: { $first: '$restaurant_id' },
          name: { $first: '$name' },
          cuisine: { $first: '$cuisine' },
          borough: { $first: '$borough' },
          address: { $first: '$address' },
          aggregatedScore: { $sum: '$grades.score' },
          gradesCount: { $sum: 1 },
        },
      },

      // Stage 3: strictly greater than 90
      { $match: { aggregatedScore: { $gt: 90 } } },

      // Stage 4: highest rating first (name as a stable tie-breaker)
      { $sort: { aggregatedScore: -1, name: 1 } },
    ]);

    res.status(200).json({
      count: topRestaurants.length,
      data: topRestaurants,
    });
  } catch (error) {
    console.error('GET /api/restaurants/top-quality error:', error);
    res.status(500).json({ message: 'Failed to run aggregation', error: error.message });
  }
});

/* =====================================================================
 * 5. POST /api/restaurants
 *    Create a new restaurant (used by the admin form).
 *
 *    Example body:
 *    {
 *      "name": "Sampaguita Kitchen",
 *      "cuisine": "Filipino",
 *      "borough": "Queens",
 *      "address": { "building": "123", "street": "Roosevelt Ave",
 *                   "zipcode": "11372", "coord": [-73.89, 40.75] },
 *      "grades": [ { "date": "2024-03-01", "grade": "A", "score": 7 } ]
 *    }
 * ===================================================================== */
router.post('/', async (req, res) => {
  try {
    // Pick only allowed fields (prevents clients from injecting unexpected ones)
    const { name, cuisine, borough, address, grades, restaurant_id } = req.body;

    // Manual validation for friendlier 400 messages
    const missing = [];
    if (!name || !String(name).trim()) missing.push('name');
    if (!cuisine || !String(cuisine).trim()) missing.push('cuisine');
    if (!borough || !String(borough).trim()) missing.push('borough');

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missing.join(', ')}`,
      });
    }

    if (grades !== undefined && !Array.isArray(grades)) {
      return res.status(400).json({ message: "'grades' must be an array" });
    }

    const newRestaurantId = restaurant_id ? String(restaurant_id).trim() : String(Date.now());

    const existing = await Restaurant.findOne({ restaurant_id: newRestaurantId }).lean();
    if (existing) {
      return res.status(409).json({
        message: `A restaurant with restaurant_id '${newRestaurantId}' already exists`,
      });
    }

    const restaurant = new Restaurant({
      name,
      cuisine,
      borough,
      address,
      grades: grades || [],
      restaurant_id: newRestaurantId,
    });

    const saved = await restaurant.save();

    res.status(201).json({ message: 'Restaurant created successfully', data: saved });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      const details =
        error.name === 'ValidationError'
          ? Object.values(error.errors).map((e) => e.message)
          : [error.message];
      return res.status(400).json({ message: 'Validation failed', errors: details });
    }

    console.error('POST /api/restaurants error:', error);
    res.status(500).json({ message: 'Failed to create restaurant', error: error.message });
  }
});

module.exports = router;