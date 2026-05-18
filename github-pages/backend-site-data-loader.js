/* Optional GitHub Pages integration.
   Put this file before assets/js/main.js, or merge it into main.js before rendering.
   Set BACKEND_API_BASE to your deployed backend URL. */
window.BACKEND_API_BASE = window.BACKEND_API_BASE || 'https://YOUR-BACKEND-URL.onrender.com';

async function loadSiteDataFromBackend() {
  try {
    const response = await fetch(`${window.BACKEND_API_BASE}/api/public/site-data`, { credentials: 'omit' });
    if (!response.ok) throw new Error('Backend data unavailable');
    const payload = await response.json();
    if (payload && payload.data) {
      window.defaultSiteData = payload.data;
      window.mksBackendDataLoadedAt = payload.updatedAt;
    }
  } catch (error) {
    console.warn('Using static site-data.js fallback:', error.message);
  }
}
