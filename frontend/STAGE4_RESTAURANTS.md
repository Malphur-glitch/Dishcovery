# Stage 4 — Restaurants checkpoint

Converted Restaurants without editing the original CSS or media. The original native checkbox filter panel, card markup, search interpretation, contextual option counts, filter tokens, sorting, 36-card chunks, automatic loading, hash popup, favorite buttons and query parameters are retained. Original source/comments remain in the original-reference folder. The page now has asynchronous loading/error/retry states and cleans up its observer and timers on navigation.

Search recognizes cuisine and borough terms (including Staten Island), combines terms within either category with OR, and combines categories, remaining words and filters with AND. Top rated retains the original label and strict score >90 condition; inspection score sums are not customer ratings. No barangay mapping is invented.

All data access goes through src/api.js. In API mode the list requires backend aggregatedScore fields, and top-filter eligibility comes from /restaurants/score-results?minScore=90. Contextual filtering/counts and sorting operate on the returned complete list. The endpoint must return all stable records; backend pagination is not yet supported. HOME_API_CONTRACT.md remains the current endpoint contract. Backend MongoDB grouping and restaurant CRUD belong to Stage 5 and are not implemented in this checkpoint.

## Validation

- Production build passed: 111 modules.
- Real Chromium tests compared original and Vue at 1440×900 and 390×844 across five query cases each: unfiltered, mixed cuisine/borough search, combined cuisine/borough/top/high-score sort, Staten Island search, and no matches. Restaurant totals, first 36 cards, option labels/counts, checked state and disabled state matched in every case.
- Twelve selector groups had matching measured rectangles at both viewport sizes, including hero, search, results, card fields and footer.
- Changing a filter kept the panel open, updated the query and badge, and Apply closed it. Native card anchors activated CSS :target; Escape closed the popup. Card favorites and modal favorite changes synchronized. Search empty state, clearing all filters and initial ?open=id passed without runtime errors.
- Mocked API checks passed for backend score values/endpoint, favorite/review operations, validation and no fallback. No live backend was contacted.

## Limits / next checkpoint

Original Google Font links remain, but webfonts were unavailable in browser QA; loaded-font rendering remains unverified. The user-requested invisible footer social slots remain. No social icons were added. Live video frames and raw screenshots are not claimed pixel-identical. Home and About validation limits remain in their checkpoint notes.

Favorites and Reviews are still placeholders. Convert Favorites next, then stop for review. No backend source, database connection or persistence has been implemented.
