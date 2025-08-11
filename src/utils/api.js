// Selalu fallback ke Railway jika env tidak ada
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://uji-coba-production.up.railway.app/api'
).replace(/\/+$/, '');