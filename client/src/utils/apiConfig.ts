// Base URL for API and Socket.io
// Automatically uses Render backend when deployed on Vercel or cloud hosts.

const DEFAULT_PROD_BACKEND = 'https://virtual-tarot.onrender.com';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local'));

export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  (isLocalhost ? '' : DEFAULT_PROD_BACKEND)
).replace(/\/$/, '');
