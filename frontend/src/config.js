// Central place for environment-dependent URLs.
//
// - API calls go through `api.js`, which uses a *relative* baseURL ('/api')
//   and relies on the Vite dev proxy (see vite.config.js) or, in
//   production, on the frontend being served from the same origin as the
//   backend (or a reverse proxy that forwards /api).
//
// - Static/uploaded files (e.g. site photos) are served directly by the
//   backend from /uploads and are NOT proxied by default, so the browser
//   needs the backend's full origin to load them. Hard-coding
//   "http://localhost:5000" only works on a developer's own machine, so
//   that value now comes from an env variable with a sensible dev default.
//
// To point the app at a different backend (e.g. when deployed), set
// VITE_API_BASE_URL in a .env file (see frontend/.env.example) before
// running `npm run build` / `npm run dev`.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Helper for building a full URL to an uploaded file such as a photo.
// `path` is expected to already start with a leading slash, e.g. "/uploads/xyz.jpg"
// (that's what the backend stores/returns on Photo.url).
export const fileUrl = (path) => (path ? `${API_BASE_URL}${path}` : '');
