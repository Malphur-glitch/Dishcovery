# Dishcovery — Stage 4 — Reviews checkpoint

All five original pages are converted along with shared navigation/footer and scrolling. Stage 5 features and final delivery remain. See STAGE4_REVIEWS.md, STAGE4_FAVORITES.md, STAGE4_RESTAURANTS.md, STAGE4_ABOUT.md, STAGE3.md and HOME_API_CONTRACT.md. No backend included.

## Windows / VS Code
Install Node.js 20.19+ or 22.12+ (this workspace uses Node 24). Extract the ZIP, open frontend in VS Code and open Terminal > New Terminal:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```
Open the localhost address printed by Vite. For production:

```powershell
npm run build
npm run preview
```

VITE_DATA_SOURCE=local runs the converted pages with the supplied dataset and browser storage. To use the documented data endpoints, set VITE_DATA_SOURCE=api and VITE_API_URL to your Express API base URL; restart Vite. API mode requires the backend contract and never falls back locally. Never put secrets in VITE_ variables.

History routing uses /, /about, /restaurants, /favorites and /reviews. Hosting must rewrite non-asset routes to index.html. Original .html links will be converted at the relevant stages.

Original source and comments are preserved separately under original/ in this package. Unmodified assets are included in frontend/public. All current dataset and localStorage access is centralized in src/api.js.

Reviews checkpoint completed. Stage 5 restaurant CRUD, borough grouping and final API contract are next. Awaiting checkpoint review as requested.

Validation: npm install and production build succeeded (117 modules). Real browser checks of all five pages and media/style byte comparisons passed; see STAGE4_ABOUT.md and STAGE3.md for the precise visual limits and remaining work.
