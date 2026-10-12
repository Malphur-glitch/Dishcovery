const Restaurant = require('../models/Restaurant');

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Builds the aggregation pipeline used for every restaurant response.
 *
 *  $match    optional filter (borough / name / cuisine / id)
 *  $addFields aggregatedScore = sum of every numeric grades[].score ($sum ignores non-numbers,
 *             and a restaurant with no grades gets 0)
 *  $match    optional aggregatedScore > minScore (STRICTLY greater)
 *  $sort     dataset order (_id) by default, or highest score first for score results
 *  $project  hide Mongo's internal _id so the response holds only the dataset's own fields
 */
function restaurantPipeline({ match, minScore, byScore = false } = {}) {
  const stages = [];
  if (match) stages.push({ $match: match });
  stages.push({ $addFields: { aggregatedScore: { $sum: '$grades.score' } } });
  if (minScore !== undefined) stages.push({ $match: { aggregatedScore: { $gt: minScore } } });
  stages.push({ $sort: byScore ? { aggregatedScore: -1, name: 1, _id: 1 } : { _id: 1 } });
  stages.push({ $project: { _id: 0 } });
  return stages;
}

const listRestaurants = (match) => Restaurant.aggregate(restaurantPipeline({ match }));

async function findRestaurant(restaurant_id) {
  const [record] = await Restaurant.aggregate(restaurantPipeline({ match: { restaurant_id } }));
  return record || null;
}

const scoreResults = (minScore) => Restaurant.aggregate(restaurantPipeline({ minScore, byScore: true }));

/**
 * Restaurants whose aggregatedScore is strictly greater than minScore, grouped by their real borough.
 * MongoDB does the scoring, filtering and grouping ($addFields, $match, $group); the restaurants of
 * each group come from the same score query used by /score-results.
 * Result: [{ borough, count, restaurants: [{ restaurant_id, name, cuisine, aggregatedScore }] }]
 */
async function groupByBorough(minScore) {
  const [groups, qualifying] = await Promise.all([
    Restaurant.aggregate([
      { $addFields: { aggregatedScore: { $sum: '$grades.score' } } },
      { $match: { aggregatedScore: { $gt: minScore } } },
      { $group: { _id: '$borough', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    scoreResults(minScore),
  ]);

  return groups.map(({ _id, count }) => ({
    borough: _id,
    count,
    restaurants: qualifying
      .filter((r) => r.borough === _id)
      .map(({ restaurant_id, name, cuisine, aggregatedScore }) => ({ restaurant_id, name, cuisine, aggregatedScore })),
  }));
}

module.exports = { escapeRegex, restaurantPipeline, listRestaurants, findRestaurant, scoreResults, groupByBorough };
