// Ambil dari env Vercel, fallback ke lokal saat dev.
// Trim trailing slash agar tidak double slash saat concat.
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
).replace(/\/+$/, '');