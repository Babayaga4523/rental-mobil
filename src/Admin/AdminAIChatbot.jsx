import React, { useState, useRef } from "react";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import "./AdminAIChatbot.css";
import { API_URL } from "../utils/api"; // Tambahkan ini

const OPENROUTER_API_URL = `${API_URL}/ai/chat`; // Ganti ke endpoint backend proxy
const MODEL = "openai/gpt-5-mini";

const AdminAIChatbot = ({ stats, omzet, orders, users }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Halo Admin! Saya adalah AI asisten website rental mobil Anda. Tanyakan apa saja tentang statistik, pemasaran, atau pengelolaan website." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Prompt system yang lebih kuat
  const getSystemPrompt = () => `
Kamu adalah AI asisten profesional untuk admin website rental mobil.
Tugas kamu adalah membantu pemilik atau admin dalam mengelola bisnis rental mobil berbasis data dan strategi pemasaran digital.

⚡ Karakteristik Jawaban:
1. Gunakan bahasa Indonesia yang baik, profesional, dan mudah dipahami.
2. Jawaban harus selalu lengkap, jelas, dan berbasis data yang tersedia.
3. Jika membahas statistik, omzet, penjualan, tren, atau strategi pemasaran, sertakan:
   - Analisis singkat tren (naik/turun, penyebab, peluang, risiko)
   - Insight atau temuan penting dari data
   - Rekomendasi praktis untuk pengambilan keputusan
4. Gunakan format yang rapi seperti bullet point, tabel, atau langkah-langkah.
5. Jika memberikan strategi, sertakan:
   - Target yang ingin dicapai
   - Langkah-langkah implementasi
   - Perkiraan dampak / hasil
6. Jangan pernah memotong jawaban atau mengatakan “jawaban terpotong”.
7. Berikan contoh penerapan nyata jika memungkinkan.

📊 Data Bisnis Rental Mobil (contoh untuk dasar analisis):
- Jumlah pemesanan bulan lalu: 124 transaksi
- Jumlah pemesanan bulan ini: 138 transaksi (naik 11,3%)
- Rata-rata durasi sewa: 2,8 hari
- Omzet bulan lalu: Rp186.000.000
- Omzet bulan ini: Rp205.500.000
- Mobil paling banyak disewa: Toyota Avanza, Honda Brio
- Channel pemasaran: Instagram Ads, Google Ads, SEO Website
- Sumber pelanggan terbesar: Instagram (45%), Google (35%), Referral (20%)

📈 Fokus Bantuan AI:
- Membantu analisis performa bulanan (penjualan, omzet, trafik website, konversi)
- Memberikan strategi marketing digital (SEO, sosial media, iklan berbayar)
- Memberikan ide promo dan bundling paket sewa
- Menyediakan insight untuk manajemen armada (mobil paling laku, perawatan)
- Memberikan rekomendasi peningkatan UX/UI website untuk meningkatkan konversi
- Menyediakan laporan singkat siap kirim ke owner

Statistik Website Saat Ini:
- Total Pesanan: ${stats?.orders ?? orders ?? 0}
- Total Omzet: Rp${(stats?.revenue ?? omzet ?? 0).toLocaleString("id-ID")}
- Jumlah Mobil: ${stats?.cars ?? 0}
- Pengguna Terdaftar: ${stats?.users ?? users ?? 0}
- Mobil Tersedia: ${stats?.availableCars ?? 0}
- Mobil Tidak Tersedia: ${stats?.unavailableCars ?? 0}
- Pesanan Pending: ${stats?.pendingOrders ?? 0}
- Pesanan Dibayar: ${stats?.paidOrders ?? 0}
`.trim();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Ambil token dari localStorage (atau context/auth state Anda)
      const token = localStorage.getItem("token"); // pastikan token sudah disimpan saat login

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          message: input
        })
      });
      const data = await response.json();
      const aiReply = data.response || "Maaf, terjadi kesalahan pada AI.";
      setMessages([...messages, userMsg, { role: "assistant", content: aiReply }]);
    } catch (err) {
      setMessages([...messages, userMsg, { role: "assistant", content: "Maaf, terjadi kesalahan koneksi ke AI." }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Komponen statistik
  const StatCard = ({ label, value, color, icon }) => (
    <div className="ai-stat-card" style={{ borderColor: color }}>
      <div className="ai-stat-icon" style={{ background: color + "22", color }}>{icon}</div>
      <div>
        <div className="ai-stat-label">{label}</div>
        <div className="ai-stat-value">{value}</div>
      </div>
    </div>
  );

  // Format angka ke rupiah
  const formatRupiah = (num) =>
    "Rp" + (num || 0).toLocaleString("id-ID");

  return (
    <div className="admin-ai-chatbot-widget">
      {open ? (
        <div className="chatbot-box shadow">
          <div className="chatbot-header d-flex align-items-center justify-content-between">
            <span><FaRobot className="me-2" />AI Admin Assistant</span>
            <button className="btn-close-chat" onClick={() => setOpen(false)}><FaTimes /></button>
          </div>
          {/* Statistik Section */}
          <div className="ai-stats-row">
            <StatCard
              label="Omzet"
              value={formatRupiah(stats?.revenue ?? omzet ?? 0)}
              color="#22c55e"
              icon={<span role="img" aria-label="omzet">💰</span>}
            />
            <StatCard
              label="Pesanan"
              value={stats?.orders ?? orders ?? 0}
              color="#6366f1"
              icon={<span role="img" aria-label="order">📦</span>}
            />
            <StatCard
              label="Pengguna"
              value={stats?.users ?? users ?? 0}
              color="#f59e42"
              icon={<span role="img" aria-label="user">👤</span>}
            />
            <StatCard
              label="Mobil"
              value={stats?.cars ?? 0}
              color="#06b6d4"
              icon={<span role="img" aria-label="car">🚗</span>}
            />
          </div>
          {/* End Statistik Section */}
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-msg ${msg.role}`}>
                <div className="msg-bubble">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input-row" onSubmit={handleSend}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Tulis pertanyaan admin..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button type="submit" className="btn-send" disabled={loading || !input.trim()}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot-fab" onClick={() => setOpen(true)}>
          <FaRobot size={24} />
        </button>
      )}
    </div>
  );
};

export default AdminAIChatbot;