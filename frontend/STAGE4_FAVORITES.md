# Stage 4 — Favorites checkpoint

Converted the original Favorites main markup, including all six supplied hero photos, literal cuisine copy, arrows and dots. Original CSS and media are unchanged. Slider wrapping, active classes, aria-hidden state and document ArrowLeft/ArrowRight behavior match favorites.js. The keyboard listener is removed when the route unmounts.

Favorites retains original newest-first ID order, skips IDs without matching restaurant records, and reuses the original restaurant-card structure. Card links open the native #restaurant modal on Favorites. Removing a star from a card or modal immediately updates the list after persistence succeeds. The fixed close target preserves scroll position. Loading, error/retry and pending states cover asynchronous data operations. Components access all records and favorites through src/api.js; API mode does not fall back to browser data.

## Validation

- Production build passed: 117 modules.
- Real Chromium compared original and Vue at 1440×900 and 390×844 using the same two saved restaurant IDs. Individual visible-copy blocks, saved card order, restaurant counts and ten selector groups of measured rectangles matched.
- All six next-arrow transitions, wrapping, dot selection and keyboard selection passed. Modal opening stayed on Favorites and activated CSS :target. Modal removal and card removal updated the list/count, and removing the last item displayed the original empty state.
- Browse restaurants navigation and back navigation with persisted removals passed. No runtime errors occurred.

## Limits / next checkpoint

Google webfonts remain unavailable in QA; their original links are preserved. Existing footer invisible social slots are retained per the user's clarification; no social icons were added. Prior checkpoint notes describe other known comparison limits. No live backend was tested; MongoDB data persistence requires teammates' implementation of the documented API.

Home, About, Restaurants and Favorites are converted. Reviews is the remaining page checkpoint. Restaurant CRUD and database grouping remain Stage 5 work. Stop here for review, then convert Reviews.
