# AGENTS.md

## Cursor Cloud specific instructions

DailyPaper is a single Node.js/Express service (`server.js`) serving a static frontend from `public/` and a small JSON API (`/api/entries`). There is no separate frontend build step; the app is served directly.

- Run the app in dev with `npm start` (`node server.js`); it listens on `http://localhost:3000` (override with `PORT`). There is no hot reload — restart the process after changing `server.js`.
- `npm test` runs `node --test` but there are currently no test files, so it reports 0 tests (this is expected, not a failure). There is no lint tooling configured.
- Runtime diary data is written to `data/entries.json` and uploaded images to `data/uploads/`; both are gitignored. `server.js` creates them on startup, so no manual DB/setup is needed.
