import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import "./AdminAIChatbot.css";
import { API_URL } from "../utils/api";

const AdminAIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Halo Admin! Saya adalah AI asisten website rental mobil Anda. Tanyakan apa saja tentang statistik, pemasaran, atau pengelolaan website." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);

  // Ambil data statistik saat chatbot dibuka
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/users/admin/stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  // Prompt system dengan data statistik real-time
  const getSystemPrompt = () => `
Kamu adalah AI asisten admin rental mobil.
Statistik saat ini:
- Total User: ${stats?.totalUsers ?? 0}
- Total Pesanan: ${stats?.totalOrders ?? 0}
- Total Omzet: Rp${(stats?.totalRevenue ?? 0).toLocaleString("id-ID")}
- Total Mobil: ${stats?.totalCars ?? 0}
- Pesanan Pending: ${stats?.pendingOrders ?? 0}
- Pesanan Dibayar: ${stats?.paidOrders ?? 0}

Tugas kamu: membantu admin dalam analisis data, memberikan insight, dan menjawab pertanyaan terkait bisnis rental mobil.
`.trim();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json"
      };
      if (token && typeof token === "string" && token.trim() && token !== "undefined" && token !== "null") {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: input,
          systemPrompt: getSystemPrompt()
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
              value={formatRupiah(stats?.revenue ?? 0)}
              color="#22c55e"
              icon={<span role="img" aria-label="omzet">💰</span>}
            />
            <StatCard
              label="Pesanan"
              value={stats?.orders ?? 0}
              color="#6366f1"
              icon={<span role="img" aria-label="order">📦</span>}
            />
            <StatCard
              label="Pengguna"
              value={stats?.users ?? 0}
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