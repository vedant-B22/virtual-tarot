// Base URL for API and Socket.io
// When running locally or on a unified server, this is empty (relative path).
// When frontend is hosted on Vercel and backend is hosted on Render/Railway,
// it uses the VITE_BACKEND_URL environment variable.

export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
