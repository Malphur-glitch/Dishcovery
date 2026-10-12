/* ==========================================================================
   DISHCOVERY | HOME PAGE: Featured Restaurants + Top Rated Restaurants
   Picks real restaurants from the data. The picks are random, but they only
   change once per time window (not on every refresh): everyone who opens the
   page in the same window sees the same restaurants.
   "Learn more" opens the restaurant pop-up on this same page.
   ========================================================================== */
// Vue computed state calls the original deterministic selection logic.
const CHANGE_EVERY_HOURS = 24; // EDIT: how often picks change (24 = once a day, 1 = every hour)
const TOP_RATED_SCORE = 90; // Original label retained for parity; these are summed inspection scores.
const HOW_MANY = 3;
  // Small seeded random generator: same seed -> same picks
  function random(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, rand) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

// A new seed every time the page is loaded/refreshed -> Top Rated changes on every refresh.
// (Module-level, so moving around the site without refreshing keeps the same Top Rated picks.)
const LOAD_SEED = Math.floor(Math.random() * 4294967296);

export function selectHomePicks(all, timestamp = Date.now(), scoreCandidates = null) {
  // Featured: still one pick per time window (CHANGE_EVERY_HOURS).
  const dayRand = random(Math.floor(timestamp / (CHANGE_EVERY_HOURS * 3600000)));
  const featured = shuffle(all.filter(r => r.meals.length), dayRand).slice(0, HOW_MANY);
  const used = new Set(featured.map(r => r.id));
  // Top Rated: random on every refresh, never the same restaurants as Featured.
  const candidates = (scoreCandidates ?? all.filter(r => r.score > TOP_RATED_SCORE)).filter(r => !used.has(r.id));
  const top = shuffle(candidates, random(LOAD_SEED)).slice(0, HOW_MANY);
  return { featured, top };
}
