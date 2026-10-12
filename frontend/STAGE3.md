# Stage 3 — Home checkpoint

## Completed

- HomeView.vue contains the original Home hero, showcase, featured/top sections, six cuisines, handwritten quote and six cuisine popups. The original text, classes, structure and comments are retained with Vue-compatible event/link syntax.
- RestaurantCard.vue reproduces the original home.js featured-card markup and deterministic cuisine photo selection.
- homePicks.js preserves the original 24-hour seed, random/shuffle sequence, three strict >90 picks, and three non-overlapping featured restaurants with meals.
- RestaurantModal.vue retains the original shared restaurant popup, favorite button, five-star review form, validation messages, add/update/delete behavior and 4200ms favorites toast.
- All dataset and localStorage access lives in asynchronous api.js functions. Legacy favorites/reviews keys and formats are unchanged. The supplied 3,772-record runtime dataset is preserved; its new JSON representation is only for fetch-compatible loading.
- Home’s minimal API mode and contract are included. API mode requires server-calculated scores and the backend score-results endpoint, with no local fallback. Backend code is not included.
- Native hash anchors retain CSS :target opening/closing and scroll locking. Vue Router continues using history routing for page navigation. This avoids history.pushState’s failure to activate CSS :target; no state-based replacement for hash behavior was introduced.
- Empty, loading, error and retry states reuse existing typography/classes. Failed browser writes now show errors rather than silently reporting success.

## Checks

- Production build passed (100 modules).
- Real Chromium comparison at 1440×900 and 390×844: all 23 checked selector groups matched original computed typography, colors, margins/padding and element rectangles, including footer layout. Comparison used reduced-motion mode and paused videos for repeatability.
- The exact original featured/top restaurant IDs matched at a fixed daily seed; video paths and autoplay/muted/loop/playsinline flags matched.
- Desktop restaurant popup dimensions, styles and meaningful text matched the original.
- Browser tests passed for cuisine popup targets, slider arrows, Escape closing, menu opening/closing, hash-close scroll preservation, initial cuisine/section hash navigation, favorite add/remove and reload persistence, review validation/add/update/delete and reload persistence, and resetting unsaved drafts when reopening a card.
- Non-reduced-motion browser checks passed for eased wheel movement, one global wheel listener across route changes, and cuisine hover video reveal.
- Dataset loading failure and empty-dataset paths passed. Mocked API checks passed for response shapes, endpoint methods, server scores, aggregation candidates and no local fallback. Those checks are not a real backend integration test.
- Original CSS files and all images/videos remain byte-identical. Components never directly access dataset files or localStorage.

## Known differences / verification limits

- Google Fonts could not load in the test browser. Both versions used the same fallback fonts. Original Google Font URLs, families and weights remain unchanged; pixel appearance with those web fonts loaded is still unverified.
- Raw screenshots are not pixel-identical: minor image/video rendering differences remain, and the original browser’s broken social-image placeholders are replaced by invisible slots per the user’s clarification that no social icons are included. Slot dimensions preserve the original footer spacing. No social icons were added. Separate compatibility.css contains only this slot rule; original CSS is unchanged.
- Data loads asynchronously, so temporary loading/error/empty states are new. Once data loads, normal Home layout matches the checked original layout.
- Same-origin existing browser storage is preserved; another hostname/port has its own browser store, as before.
- About, Restaurants, Favorites and Reviews page contents remain placeholders for Stage 4. Their shared navigation/footer already work. Following their links shows the checkpoint placeholders.
- Restaurant CRUD, grouped-result controls, final API contract, database integration and final production/deployment checks remain for later stages.
- The inspection-score “Top Rated” naming conflict remains documented; the original label has not been changed.

## Next checkpoint

Stage 4 starts with About, then Restaurants, Favorites and Reviews one at a time. Stop after each page for review, as requested in the supplied instructions.
