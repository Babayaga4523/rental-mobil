export const API_URL =
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
    : "https://uji-coba-production.up.railway.app") + "/api";