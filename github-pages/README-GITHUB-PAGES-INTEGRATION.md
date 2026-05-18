# GitHub Pages Integration

GitHub Pages can host the public website, but it cannot run secure admin login by itself.
Use one of these options:

## Option A — Static export, simplest
1. Login to the backend admin at `https://YOUR-BACKEND/admin`.
2. Edit website data.
3. Download `site-data.js` from the admin Publish screen.
4. Replace `assets/js/site-data.js` in the GitHub Pages repository.
5. Commit and push.

This keeps the public site fully static.

## Option B — Public API data
1. Deploy the backend.
2. Set `window.BACKEND_API_BASE` to your backend URL.
3. Load `backend-site-data-loader.js` before the main website rendering script.
4. Keep `assets/js/site-data.js` as fallback.

This lets the public site fetch fresh content from `/api/public/site-data`.
