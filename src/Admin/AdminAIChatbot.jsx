import React, { useState, useRef, useEffect } from "react";
import { FaRobot, FaPaperPlane, FaTimes, FaChartLine, FaMoneyBillWave, FaCar, FaUsers, FaClipboardCheck, FaHourglassHalf, FaLightbulb } from "react-icons/fa";
import { IoMdStats } from "react-icons/io";
import "./AdminAIChatbot.css";
import { API_URL } from "../utils/api";

const AdminAIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Halo Admin! Saya adalah AI asisten cerdas untuk manajemen rental mobil Anda. Saya bisa membantu dengan:",
      quickReplies: [
        "Tampilkan analisis penjualan bulan ini",
        "Apa rekomendasi untuk meningkatkan pendapatan?",
        "Berapa tingkat konversi pemesanan?",
        "Tampilkan prediksi permintaan minggu depan"
      ]
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const messagesEndRef = useRef(null);

  // Lock body scroll when chat is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('chat-open');
    } else {
      document.body.classList.remove('chat-open');
    }
    return () => {
      document.body.classList.remove('chat-open');
    };
  }, [open]);

  // Fetch statistics when chatbot opens
  useEffect(() => {
    if (!open) return;
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/users/admin/stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, [open]);

  // System prompt hanya pakai data dari backend
  const getSystemPrompt = () => {
    const currentDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
Kamu adalah AI asisten admin rental mobil yang juga dapat menjawab pertanyaan umum di luar topik rental mobil jika dibutuhkan.

INFORMASI SAAT INI:
Tanggal: ${currentDate}

STATISTIK RENTAL:
- Total User: ${stats?.totalUsers ?? 0}
- Total Pesanan: ${stats?.totalOrders ?? 0}
- Total Omzet: Rp${(stats?.totalRevenue ?? 0).toLocaleString("id-ID")}
- Total Mobil: ${stats?.totalCars ?? 0}
- Pesanan Pending: ${stats?.pendingOrders ?? 0}
- Pesanan Dibayar: ${stats?.paidOrders ?? 0}

TUGAS KAMU:
1. Jika pertanyaan berkaitan dengan rental mobil, jawab dengan analisis bisnis, strategi, dan insight data.
2. Jika pertanyaan di luar rental mobil, jawab dengan pengetahuan umum terbaikmu.
3. Jika tidak tahu jawabannya, katakan dengan jujur.
`.trim();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = {
      role: "user",
      content: input,
      quickReplies: []
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: input,
          systemPrompt: getSystemPrompt(),
          context: {
            stats,
            currentDate: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();
      const aiReply = {
        role: "assistant",
        content: data.response || "Maaf, terjadi kesalahan pada AI.",
        quickReplies: generateQuickReplies(input, data.response)
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan koneksi ke AI.",
          quickReplies: []
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Generate context-aware quick replies
  const generateQuickReplies = (input, response) => {
    const lowerInput = input.toLowerCase();
    const lowerResponse = (response || "").toLowerCase();

    if (lowerInput.includes('penjualan') || lowerResponse.includes('penjualan')) {
      return [
        "Tampilkan tren penjualan 3 bulan terakhir",
        "Bandingkan penjualan minggu ini dengan minggu lalu",
        "Produk apa yang paling laku bulan ini?",
        "Buat prediksi penjualan bulan depan"
      ];
    }

    if (lowerInput.includes('rekomendasi') || lowerResponse.includes('rekomendasi')) {
      return [
        "Bagaimana cara meningkatkan konversi?",
        "Apa promosi yang paling efektif?",
        "Saran untuk mengurangi mobil yang menganggur",
        "Optimasi harga berdasarkan permintaan"
      ];
    }

    if (lowerInput.includes('pelanggan') || lowerResponse.includes('pelanggan')) {
      return [
        "Berapa tingkat retensi pelanggan?",
        "Apa karakteristik pelanggan setia?",
        "Bagaimana meningkatkan kepuasan pelanggan?",
        "Tampilkan segmentasi pelanggan"
      ];
    }

    // Default quick replies
    return [
      "Tampilkan analisis performa bulan ini",
      "Apa mobil yang paling menguntungkan?",
      "Bagaimana utilisasi armada kita?",
      "Berikan rekomendasi pemasaran"
    ];
  };

  const formatRupiah = (num) => "Rp" + (num || 0).toLocaleString("id-ID");

  const StatCard = ({ label, value, color, icon }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );

  // Quick reply button component
  const QuickReply = ({ text }) => (
    <button
      className="quick-reply"
      onClick={() => {
        setInput(text);
        setTimeout(() => {
          document.querySelector('.chat-input button[type="submit"]')?.click();
        }, 50);
      }}
    >
      {text}
    </button>
  );

  return (
    <div className="admin-ai-chatbot">
      {/* Floating Action Button */}
      <button
        className={`chatbot-fab ${open ? 'hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open AI Assistant"
      >
        <FaRobot />
        <span className="pulse-dot"></span>
      </button>

      {/* Chatbot Container */}
      <div className={`chatbot-container ${open ? 'open' : ''}`}>
        {/* Chatbot Header */}
        <div className="chatbot-header">
          <div className="header-left">
            <div className="ai-avatar">
              <FaRobot />
            </div>
            <div className="header-info">
              <h3>AI Admin Assistant</h3>
              <p>Analytics & Business Intelligence</p>
            </div>
          </div>
          <button
            className="close-btn"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <FaTimes />
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="stats-dashboard">
          <div className="dashboard-header">
            <IoMdStats />
            <h4>Statistik Real-time</h4>
          </div>
          <div className="stats-grid">
            <StatCard
              label="Total User"
              value={stats?.totalUsers ?? 0}
              color="#6366f1"
              icon={<FaUsers />}
            />
            <StatCard
              label="Total Pesanan"
              value={stats?.totalOrders ?? 0}
              color="#8b5cf6"
              icon={<FaChartLine />}
            />
            <StatCard
              label="Total Omzet"
              value={formatRupiah(stats?.totalRevenue ?? 0)}
              color="#10b981"
              icon={<FaMoneyBillWave />}
            />
            <StatCard
              label="Total Mobil"
              value={stats?.totalCars ?? 0}
              color="#0ea5e9"
              icon={<FaCar />}
            />
            <StatCard
              label="Pending"
              value={stats?.pendingOrders ?? 0}
              color="#f59e0b"
              icon={<FaHourglassHalf />}
            />
            <StatCard
              label="Dibayar"
              value={stats?.paidOrders ?? 0}
              color="#22c55e"
              icon={<FaClipboardCheck />}
            />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <React.Fragment key={idx}>
              <div className={`message ${msg.role}`}>
                <div className="message-content">
                  {msg.content}
                  {msg.role === 'assistant' && (
                    <div className="insight-tag">
                      <FaLightbulb /> Insight Bisnis
                    </div>
                  )}
                </div>
              </div>
              {msg.quickReplies && msg.quickReplies.length > 0 && (
                <div className="quick-replies">
                  {msg.quickReplies.map((reply, i) => (
                    <QuickReply
                      key={i}
                      text={reply}
                    />
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
          {loading && (
            <div className="message assistant">
              <div className="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form className="chat-input" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Tanya tentang analisis bisnis..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAIChatbot;