# Stage 2 — Shared structure

Completed:
- App.vue renders original sibling checkbox, scrim, menu and header structures without extra wrappers breaking CSS sibling selectors.
- Navbar.vue retains each original page’s links, classes, menu cards, current-page labels and restaurant filter trigger. Filter controls remain pending Restaurants conversion.
- Footer.vue retains each page’s content/link destinations, SVG wordmark and pointer glow. Original social anchor slots are retained, with no social images added, per user clarification. Original source files are untouched.
- Internal links use Vue Router and preserve query/hash destinations. Legacy .html entries redirect to canonical routes with queries/hashes intact.
- Global weighted scrolling initializes once through App.vue, preserving the original constants and wheel safeguards. Listeners and animation frames are cleaned up on unmount. About-specific header hiding is separate.
- Page navigation closes the menu/filter, resets scroll to top, and preserves intentional anchor navigation. Modal hash changes do not reset scroll. Page styles retain original order and are not reloaded merely because query/hash changes.

Validation:
- Production build passed (46 modules).
- DOM simulation of production bundle passed: all five routes, route-specific stylesheet counts and About body class; menu click, Enter and Escape; menu closure after navigation; hash links; legacy URL query/hash preservation; About header hide with an outro fixture; modal hash navigation without a scroll reset; no social images; no runtime errors. Checkbox change events were explicitly dispatched in the DOM simulation; native browser behavior still needs browser verification.
- Earlier byte comparisons verified assets unchanged. Original CSS remains untouched.
- A real browser could not be installed: download returned invalid/truncated content. Desktop/mobile screenshot comparison, weighted-wheel feel, hover and animation appearance therefore remain unverified.

Known differences and pending work:
- All five main page contents are placeholders. This is a shared-structure checkpoint, not a complete working website.
- Real Home anchor/cuisine modal targets and About outro will exist after their page conversions; their full behavior cannot yet be checked.
- Restaurant filter panel and count are deferred to Restaurants conversion; its original header trigger is present.
- Data adapter, restaurant cards/details, searches, favorites/reviews persistence, grouping, score previews and restaurant CRUD are deferred.
- No backend source or database connection created. API integration and MongoDB persistence remain unverified.

Checkpoint: stop after Stage 2 as specified in the supplied instructions. Continue with Home after review.
