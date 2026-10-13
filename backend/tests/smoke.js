const API = (process.env.API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// A stand-in for one browser: it keeps its own cookie jar, like the real frontend will.
class Browser {
  constructor() { this.cookie = ''; }
  async call(method, path, body, extraHeaders = {}) {
    const res = await fetch(API + path, {
      method,
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN, ...(this.cookie ? { Cookie: this.cookie } : {}), ...extraHeaders },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    const set = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    if (set.length) this.cookie = set.map((c) => c.split(';')[0]).join('; ');
    let json = null;
    try { json = await res.json(); } catch { /* not JSON */ }
    return { status: res.status, json, headers: res.headers };
  }
}

let failures = 0;
function check(name, condition, detail = '') {
  if (condition) console.log(`  PASS  ${name}`);
  else { failures++; console.log(`  FAIL  ${name} ${detail}`); }
}
const isError = (r, status) => r.status === status && typeof r.json?.error?.message === 'string' && !('data' in r.json);
const section = (t) => console.log(`\n${t}`);

(async () => {
  const A = new Browser();
  const B = new Browser();
  let testId = null;

  try {
    section('Health and CORS');
    let r = await A.call('GET', '/health');
    check('health returns { data }', r.status === 200 && r.json?.data?.status === 'ok');
    check('database connected', r.json?.data?.database === 'connected');
    r = await A.call('OPTIONS', '/favorites/1', undefined, { 'Access-Control-Request-Method': 'PUT', 'Access-Control-Request-Headers': 'content-type' });
    check('preflight allows the frontend origin', r.headers.get('access-control-allow-origin') === ORIGIN, `got ${r.headers.get('access-control-allow-origin')}`);
    check('preflight allows credentials', r.headers.get('access-control-allow-credentials') === 'true');
    r = await A.call('GET', '/health', undefined, { Origin: 'http://evil.example' });
    check('other origins get no CORS header', !r.headers.get('access-control-allow-origin'));

    section('Restaurant reads');
    r = await A.call('GET', '/restaurants');
    const all = r.json?.data;
    check('list is { data: [...] } with records', r.status === 200 && Array.isArray(all) && all.length > 0, `status ${r.status}`);
    const sample = all[0];
    check('records keep dataset fields', sample && typeof sample.restaurant_id === 'string' && sample.address && Array.isArray(sample.grades) && Array.isArray(sample.Meals) && sample.borough && sample.cuisine && sample.name);
    check('no Mongo _id leaks out', all.every((x) => !('_id' in x)));
    const sum = (x) => x.grades.reduce((s, g) => s + (typeof g.score === 'number' ? g.score : 0), 0);
    check('aggregatedScore is numeric and equals the sum of grades[].score', all.every((x) => Number.isFinite(x.aggregatedScore) && x.aggregatedScore === sum(x)));
    r = await A.call('GET', `/restaurants/${sample.restaurant_id}`);
    check('get one by restaurant_id', r.status === 200 && r.json.data.restaurant_id === sample.restaurant_id && r.json.data.aggregatedScore === sample.aggregatedScore);
    r = await A.call('GET', '/restaurants/does-not-exist');
    check('unknown id -> 404 { error: { message } }', isError(r, 404));

    section('Search and borough filter');
    const word = sample.name.split(' ')[0].toLowerCase();
    r = await A.call('GET', `/restaurants/search?name=${encodeURIComponent(word)}`);
    check('name search (case-insensitive, partial)', r.status === 200 && r.json.data.length > 0 && r.json.data.every((x) => x.name.toLowerCase().includes(word)));
    r = await A.call('GET', `/restaurants/search?cuisine=${sample.cuisine.toLowerCase()}`);
    check('cuisine search', r.status === 200 && r.json.data.length > 0 && r.json.data.every((x) => x.cuisine === sample.cuisine));
    r = await A.call('GET', '/restaurants/search');
    check('search without terms -> 400', isError(r, 400));
    r = await A.call('GET', `/restaurants/borough/${encodeURIComponent(sample.borough.toUpperCase())}`);
    check('borough filter (case-insensitive)', r.status === 200 && r.json.data.length > 0 && r.json.data.every((x) => x.borough === sample.borough));
    r = await A.call('GET', `/restaurants?borough=${encodeURIComponent(sample.borough)}`);
    check('?borough= on the list', r.status === 200 && r.json.data.length > 0 && r.json.data.every((x) => x.borough === sample.borough));

    section('Aggregation');
    r = await A.call('GET', '/restaurants/score-results?minScore=90');
    const top = r.json?.data;
    check('score-results returns only aggregatedScore > 90', r.status === 200 && Array.isArray(top) && top.every((x) => x.aggregatedScore > 90));
    check('score-results matches an independent count', top.length === all.filter((x) => x.aggregatedScore > 90).length, `${top.length} vs ${all.filter((x) => x.aggregatedScore > 90).length}`);
    check('score-results sorted highest first', top.every((x, i) => i === 0 || top[i - 1].aggregatedScore >= x.aggregatedScore));
    const edge = all.find((x) => x.aggregatedScore > 0);
    r = await A.call('GET', `/restaurants/score-results?minScore=${edge.aggregatedScore}`);
    check('threshold is strict (a score equal to minScore is excluded)', r.json.data.every((x) => x.restaurant_id !== edge.restaurant_id));
    r = await A.call('GET', '/restaurants/score-results');
    check('minScore defaults to 90', r.json.data.length === top.length);
    r = await A.call('GET', '/restaurants/score-results?minScore=abc');
    check('bad minScore -> 400', isError(r, 400));
    r = await A.call('GET', '/restaurants/by-borough?minScore=90');
    const groups = r.json?.data;
    check('by-borough groups by real borough', r.status === 200 && Array.isArray(groups) && groups.length > 0 && groups.every((g) => ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island'].includes(g.borough) && g.count === g.restaurants.length));
    check('group counts add up to the score results', groups.reduce((s, g) => s + g.count, 0) === top.length);
    check('every grouped restaurant belongs to its borough', groups.every((g) => g.restaurants.every((x) => all.find((a) => a.restaurant_id === x.restaurant_id)?.borough === g.borough)));

    section('Restaurant add / edit / delete');
    r = await A.call('POST', '/restaurants', { name: 'Temp', cuisine: 'Thai' });
    check('missing borough -> 400', isError(r, 400) && /borough/.test(r.json.error.message));
    r = await A.call('POST', '/restaurants', { name: 'Temp', cuisine: 'Thai', borough: 'Atlantis' });
    check('unknown borough -> 400', isError(r, 400));
    r = await A.call('POST', '/restaurants', { name: 'Temp', cuisine: 'Thai', borough: 'Queens', grades: [{ date: 'nope', grade: 'A', score: -1 }] });
    check('bad grade -> 400', isError(r, 400));
    r = await A.call('POST', '/restaurants', 'not json {');
    check('invalid JSON -> 400 envelope', isError(r, 400));
    r = await A.call('POST', '/restaurants', {
      name: 'Smoke Test Kitchen', cuisine: 'Thai', borough: 'queens',
      address: { building: '1', street: 'Test St', zipcode: '11101', coord: [-73.9, 40.7] },
      grades: [{ date: '2024-01-01', grade: 'A', score: 40 }, { date: { $date: 1700000000000 }, grade: 'B', score: 55 }],
      Meals: ['Pad Thai', 'Larb'], hacker: 'ignored',
    });
    testId = r.json?.data?.restaurant_id;
    check('add -> 201 with record', r.status === 201 && testId && r.json.data.name === 'Smoke Test Kitchen');
    check('borough normalised, aggregatedScore computed, Meals kept', r.json.data.borough === 'Queens' && r.json.data.aggregatedScore === 95 && r.json.data.Meals.length === 2);
    check('unknown fields dropped', !('hacker' in r.json.data));
    r = await A.call('GET', '/restaurants/score-results');
    check('new 95-point restaurant appears in score results', r.json.data.some((x) => x.restaurant_id === testId));
    r = await A.call('POST', '/restaurants', { name: 'Dup', cuisine: 'Thai', borough: 'Queens', restaurant_id: testId });
    check('duplicate restaurant_id -> 409', isError(r, 409));
    r = await A.call('PUT', `/restaurants/${testId}`, { name: 'Smoke Test Kitchen 2', grades: [{ date: '2024-01-01', grade: 'A', score: 10 }] });
    check('edit -> updated record and recalculated score', r.status === 200 && r.json.data.name === 'Smoke Test Kitchen 2' && r.json.data.aggregatedScore === 10 && r.json.data.cuisine === 'Thai');
    r = await A.call('PUT', `/restaurants/${testId}`, { restaurant_id: 'other' });
    check('changing restaurant_id -> 400', isError(r, 400));
    r = await A.call('PUT', `/restaurants/${testId}`, {});
    check('empty edit -> 400', isError(r, 400));
    r = await A.call('PUT', '/restaurants/does-not-exist', { name: 'x' });
    check('edit unknown id -> 404', isError(r, 404));
    r = await A.call('DELETE', '/restaurants/does-not-exist');
    check('delete unknown id -> 404', isError(r, 404));

    section('Favorites (per browser)');
    const other = all.find((x) => x.restaurant_id !== testId).restaurant_id;
    r = await A.call('GET', '/favorites');
    check('new browser starts with no favorites', r.status === 200 && Array.isArray(r.json.data) && r.json.data.length === 0);
    check('anonymous id cookie is issued', A.cookie.startsWith('dishcovery_uid='));
    r = await A.call('PUT', `/favorites/${other}`);
    check('add favorite returns full array', r.status === 200 && JSON.stringify(r.json.data) === JSON.stringify([other]));
    r = await A.call('PUT', `/favorites/${testId}`);
    check('newest favorite first', JSON.stringify(r.json.data) === JSON.stringify([testId, other]));
    r = await A.call('PUT', `/favorites/${other}`);
    check('adding again is idempotent (order unchanged, no duplicate)', JSON.stringify(r.json.data) === JSON.stringify([testId, other]));
    r = await A.call('PUT', '/favorites/does-not-exist');
    check('favorite of unknown restaurant -> 404', isError(r, 404));
    r = await B.call('GET', '/favorites');
    check("another browser does not see A's favorites", r.status === 200 && r.json.data.length === 0);
    r = await A.call('DELETE', `/favorites/${other}`);
    check('remove favorite returns remaining array', JSON.stringify(r.json.data) === JSON.stringify([testId]));
    r = await A.call('DELETE', `/favorites/${other}`);
    check('removing again is idempotent', r.status === 200 && JSON.stringify(r.json.data) === JSON.stringify([testId]));

    section('Reviews (per browser)');
    const review = { rid: testId, name: 'Smoke Test Kitchen 2', cuisine: 'Thai', borough: 'Queens', rating: 4, text: '  Enjoyed our visit.  ', ts: Date.now() - 1000 };
    r = await A.call('GET', '/reviews');
    check('new browser starts with no reviews', r.status === 200 && r.json.data.length === 0);
    r = await A.call('PUT', `/reviews/${testId}`, review);
    check('add review returns the saved object', r.status === 200 && r.json.data.rid === testId && r.json.data.rating === 4 && r.json.data.text === 'Enjoyed our visit.' && !('ownerId' in r.json.data) && !('_id' in r.json.data));
    r = await A.call('PUT', `/reviews/${other}`, { ...review, rid: other, name: 'Other', ts: Date.now() });
    r = await A.call('GET', '/reviews');
    check('reviews listed newest first', r.json.data.length === 2 && r.json.data[0].rid === other && r.json.data[1].rid === testId);
    r = await A.call('PUT', `/reviews/${testId}`, { ...review, rating: 5, text: 'Even better.', ts: Date.now() });
    check('editing replaces the one review (no duplicate)', r.json.data.rating === 5);
    r = await A.call('GET', '/reviews');
    check('edited review moves to the top, still 2 reviews', r.json.data.length === 2 && r.json.data[0].rid === testId && r.json.data[0].text === 'Even better.');
    for (const [label, patch] of [
      ['rating 0', { rating: 0 }], ['rating 6', { rating: 6 }], ['rating 3.5', { rating: 3.5 }], ['rating as text', { rating: '4' }],
      ['empty text', { text: '   ' }], ['601-character text', { text: 'x'.repeat(601) }], ['rid mismatch', { rid: 'zzz' }], ['bad ts', { ts: 'yesterday' }],
    ]) {
      r = await A.call('PUT', `/reviews/${testId}`, { ...review, ...patch });
      check(`rejects ${label} -> 400`, isError(r, 400));
    }
    r = await A.call('PUT', `/reviews/${'x'}`, { ...review, rid: 'x' });
    check('review of unknown restaurant -> 404', isError(r, 404));
    r = await B.call('GET', '/reviews');
    check("another browser does not see A's reviews", r.json.data.length === 0);
    r = await B.call('DELETE', `/reviews/${testId}`);
    check("another browser cannot delete A's review", r.status === 200 && r.json.data === null);
    r = await A.call('GET', '/reviews');
    check("...and A's review is still there", r.json.data.some((x) => x.rid === testId));
    r = await A.call('DELETE', `/reviews/${other}`);
    check('delete review -> { data: null }', r.status === 200 && r.json.data === null && Object.hasOwn(r.json, 'data'));
    r = await A.call('GET', '/reviews');
    check('deleted review is gone', r.json.data.length === 1 && r.json.data[0].rid === testId);

    section('Cleanup and cascade');
    r = await A.call('DELETE', `/restaurants/${testId}`);
    check('delete restaurant', r.status === 200 && r.json.data.deleted === true);
    r = await A.call('GET', `/restaurants/${testId}`);
    check('deleted restaurant is gone (404)', isError(r, 404));
    r = await A.call('GET', '/favorites');
    check("its favorites were removed", !r.json.data.includes(testId));
    r = await A.call('GET', '/reviews');
    check("its reviews were removed", !r.json.data.some((x) => x.rid === testId));
    testId = null;

    section('Misc');
    r = await A.call('GET', '/nope');
    check('unknown route -> 404 { error: { message } }', isError(r, 404));
  } catch (err) {
    failures++;
    console.log('  FAIL  test run crashed:', err);
  } finally {
    if (testId) await new Browser().call('DELETE', `/restaurants/${testId}`).catch(() => {});
  }

  console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
