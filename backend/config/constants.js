// The dataset uses the five New York boroughs (no mapping to Angeles barangays was applied).
// New or edited restaurants must use one of these. Add to the list if the team later needs more.
const BOROUGHS = ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island'];

const DEFAULT_MIN_SCORE = 90;
const MAX_REVIEW_LENGTH = 600;

module.exports = { BOROUGHS, DEFAULT_MIN_SCORE, MAX_REVIEW_LENGTH };
