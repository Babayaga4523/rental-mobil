import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes } from "react-icons/fa";
import "./AdminAIChatbot.css";
import { API_URL } from "../utils/api";

const AdminAIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Halo Admin! Saya adalah AI asisten website rental mobil Anda. Tanyakan apa saja tentang statistik, pemasaran, atau pengelolaan website.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);

  // Ambil data statistik saat chatbot dibuka
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/users/admin/stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  // Prompt system dengan data statistik real-time
  const getSystemPrompt = () =>
    `
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
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (
        token &&
        typeof token === "string" &&
        token.trim() &&
        token !== "undefined" &&
        token !== "null"
      ) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: input,
          systemPrompt: getSystemPrompt(),
        }),
      });
      const data = await response.json();
      const aiReply = data.response || "Maaf, terjadi kesalahan pada AI.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiReply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, terjadi kesalahan koneksi ke AI." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Format angka ke rupiah
  const formatRupiah = (num) => "Rp" + (num || 0).toLocaleString("id-ID");

  // Komponen statistik dengan Bootstrap Card
  const StatCard = ({ label, value, color, icon }) => (
    <div className="col-6 col-md-3 mb-3">
      <div className="card text-center shadow-sm border-0 h-100">
        <div
          className="card-body d-flex flex-column align-items-center justify-content-center"
          style={{ background: color + "10", borderRadius: 12 }}
        >
          <div
            className="mb-2"
            style={{
              fontSize: 28,
              color,
              background: color + "22",
              borderRadius: "50%",
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          <div className="fw-semibold" style={{ color, fontSize: 15 }}>
            {label}
          </div>
          <div className="fs-5 fw-bold mt-1" style={{ color: "#222" }}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-ai-chatbot-widget">
      {open ? (
        <div
          className="chatbot-box shadow-lg"
          style={{
            width: 400,
            maxWidth: "95vw",
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1050,
            borderRadius: 18,
            background: "#fff",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: 600,
            maxHeight: "90vh",
          }}
        >
          <div
            className="chatbot-header d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
            style={{ background: "#f8fafc" }}
          >
            <span className="fw-bold">
              <FaRobot className="me-2" />
              AI Admin Assistant
            </span>
            <button
              className="btn btn-sm btn-light"
              onClick={() => setOpen(false)}
              style={{ borderRadius: "50%" }}
            >
              <FaTimes />
            </button>
          </div>
          {/* Statistik Section */}
          <div className="container-fluid py-2" style={{ background: "#f1f5f9" }}>
            <div className="row g-2">
              <StatCard
                label="Total User"
                value={stats?.totalUsers ?? 0}
                color="#f59e42"
                icon={<span role="img" aria-label="user">👤</span>}
              />
              <StatCard
                label="Total Pesanan"
                value={stats?.totalOrders ?? 0}
                color="#6366f1"
                icon={<span role="img" aria-label="order">📦</span>}
              />
              <StatCard
                label="Total Omzet"
                value={formatRupiah(stats?.totalRevenue ?? 0)}
                color="#22c55e"
                icon={<span role="img" aria-label="omzet">💰</span>}
              />
              <StatCard
                label="Total Mobil"
                value={stats?.totalCars ?? 0}
                color="#06b6d4"
                icon={<span role="img" aria-label="car">🚗</span>}
              />
            </div>
            <div className="row g-2 mt-1">
              <StatCard
                label="Pending"
                value={stats?.pendingOrders ?? 0}
                color="#f43f5e"
                icon={<span role="img" aria-label="pending">⏳</span>}
              />
              <StatCard
                label="Dibayar"
                value={stats?.paidOrders ?? 0}
                color="#16a34a"
                icon={<span role="img" aria-label="paid">✅</span>}
              />
            </div>
          </div>
          {/* End Statistik Section */}
          <div
            className="chatbot-messages flex-grow-1 px-3 py-2"
            style={{
              overflowY: "auto",
              background: "#f8fafc",
              minHeight: 0,
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-msg mb-2 d-flex ${
                  msg.role === "user" ? "justify-content-end" : "justify-content-start"
                }`}
              >
                <div
                  className={`msg-bubble px-3 py-2 rounded-3 ${
                    msg.role === "user"
                      ? "bg-primary text-white"
                      : "bg-light border"
                  }`}
                  style={{
                    maxWidth: "80%",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form
            className="chatbot-input-row d-flex border-top p-2 bg-white"
            onSubmit={handleSend}
          >
            <input
              type="text"
              className="form-control me-2"
              placeholder="Tulis pertanyaan admin..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
              style={{ borderRadius: 12 }}
            />
            <button
              type="submit"
              className="btn btn-primary d-flex align-items-center justify-content-center"
              disabled={loading || !input.trim()}
              style={{ borderRadius: 12, minWidth: 44, minHeight: 44 }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </form>
        </div>
      ) : (
        <button
          className="chatbot-fab btn btn-primary shadow-lg"
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 1040,
            borderRadius: "50%",
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          <FaRobot />
        </button>
      )}
    </div>
  );
};

export default AdminAIChatbot;