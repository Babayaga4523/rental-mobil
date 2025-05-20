import axios from "axios";

const API_URL = "http://localhost:3000/api";

// Ambil semua notifikasi
export const fetchNotifications = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
};

// Tandai satu notifikasi sebagai sudah dibaca
export const markAsRead = async (id, token) => {
  try {
    await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {}
};

// Tandai semua notifikasi sebagai sudah dibaca
export const markAllAsRead = async (token) => {
  try {
    await axios.put(`${API_URL}/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {}
};

// Hapus satu notifikasi
export const deleteNotification = async (id, token) => {
  try {
    await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {}
};

// Hapus semua notifikasi
export const deleteAllNotifications = async (token) => {
  try {
    await axios.delete(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch {}
};