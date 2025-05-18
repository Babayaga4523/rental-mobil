import React, { useState, useEffect } from "react";
import {
  FaSignOutAlt, FaUserCog, FaBars,
  FaMoon, FaSun, FaUserEdit,
  FaKey, FaEnvelope, FaPhone,
  FaUserShield, FaCog, FaBell
} from "react-icons/fa";
import {
  Dropdown, Modal, Button,
  Form, Badge, Alert
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

const API_URL = "http://localhost:3000/api";

const AdminNavbar = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [admin, setAdmin] = useState({
    id: "",
    name: "Admin",
    email: "admin@email.com",
    no_tlpn: "-",
    role: "admin",
    lastLogin: new Date().toISOString()
  });
  const [passwordForm, setPasswordForm] = useState({
    old: "",
    new: "",
    confirm: ""
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const navigate = useNavigate();

  // Fetch admin profile from backend
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const adminId = JSON.parse(atob(token.split('.')[1])).id;
        const res = await axios.get(`${API_URL}/users/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.user) {
          setAdmin({
            id: res.data.user.id,
            name: res.data.user.name,
            email: res.data.user.email,
            no_tlpn: res.data.user.no_tlpn || "-",
            role: res.data.user.role || "admin",
            lastLogin: res.data.user.lastLogin || new Date().toISOString()
          });
        }
      } catch (err) {
        setAdmin({
          ...admin,
          name: localStorage.getItem("adminName") || "Admin",
          email: localStorage.getItem("adminEmail") || "admin@email.com"
        });
      }
    };
    fetchAdmin();
  }, []);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
          setUnreadCount(res.data.filter(n => !n.read).length);
        }
      } catch (err) {
        // fallback dummy jika gagal
        setNotifications([
          { id: 1, message: "Pesanan baru diterima", time: "10 menit lalu", read: false },
          { id: 2, message: "Pembayaran dikonfirmasi", time: "1 jam lalu", read: true },
          { id: 3, message: "Mobil baru ditambahkan", time: "2 hari lalu", read: true }
        ]);
        setUnreadCount(1);
      }
    };
    fetchNotifications();
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    navigate("/login");
  };

  // Change password via API
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setAlert({ show: false, message: "", variant: "" });
    if (passwordForm.new !== passwordForm.confirm) {
      setAlert({ show: true, message: "Password baru tidak cocok!", variant: "danger" });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/users/${admin.id}/password`,
        {
          oldPassword: passwordForm.old,
          newPassword: passwordForm.new
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ show: true, message: "Password berhasil diubah!", variant: "success" });
      setTimeout(() => {
        setShowSettings(false);
        setPasswordForm({ old: "", new: "", confirm: "" });
        setAlert({ show: false, message: "", variant: "" });
      }, 1500);
    } catch (err) {
      setAlert({
        show: true,
        message: err.response?.data?.message || "Gagal mengubah password",
        variant: "danger"
      });
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(notifications.filter(n => !n.read && n.id !== id).length);

    // Update ke backend
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      // Optional: tampilkan error jika gagal update
    }
  };

  // Tandai semua notifikasi sebagai sudah dibaca
  const markAllAsRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {}
  };

  const formatLastLogin = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <nav
        className="admin-navbar dark"
        style={{
          background: "#181a20",
          color: "#fff",
          fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
          fontWeight: 600,
          fontSize: "1rem"
        }}
      >
        {/* Left Section */}
        <div className="navbar-left">
          <button className="sidebar-toggle" onClick={toggleSidebar} style={{ color: "#fff" }}>
            <FaBars />
          </button>
          
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Dark Mode Toggle */}
          <button className="theme-toggle" onClick={toggleDarkMode} style={{ color: "#fff" }}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Notifications */}
          <Dropdown align="end" className="notifications-dropdown">
            <Dropdown.Toggle variant="link" className="notification-toggle" style={{ color: "#fff" }}>
              <FaBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </Dropdown.Toggle>
            <Dropdown.Menu className="notification-menu dark">
              <Dropdown.Header className="notification-header d-flex justify-content-between align-items-center">
                <span>Notifikasi ({notifications.length})</span>
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="outline-light"
                    style={{ fontSize: "0.85rem", padding: "2px 10px" }}
                    onClick={markAllAsRead}
                  >
                    Tandai Semua Dibaca
                  </Button>
                )}
              </Dropdown.Header>
              {notifications.length === 0 ? (
                <Dropdown.Item className="text-muted text-center">
                  Tidak ada notifikasi.
                </Dropdown.Item>
              ) : (
                notifications.map(notification => (
                  <Dropdown.Item
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                    style={{ color: "#fff", background: notification.read ? "transparent" : "#23272b" }}
                  >
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{notification.time}</div>
                  </Dropdown.Item>
                ))
              )}
              <Dropdown.Divider />
              <Dropdown.Item className="text-center text-primary" style={{ color: "#0d6efd" }}>
                Lihat Semua
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          {/* User Profile Dropdown */}
          <Dropdown align="end" className="profile-dropdown">
            <Dropdown.Toggle variant="link" className="profile-toggle" style={{ color: "#fff" }}>
              <div className="profile-avatar" style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff"
              }}>
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <div className="profile-name" style={{ color: "#fff", fontWeight: 700 }}>{admin.name}</div>
                <div className="profile-role" style={{ color: "#bdbdbd" }}>{admin.role}</div>
              </div>
            </Dropdown.Toggle>
            <Dropdown.Menu className="profile-menu dark">
              <Dropdown.Item onClick={() => setShowProfile(true)} style={{ color: "#fff" }}>
                <FaUserEdit className="menu-icon" />
                Profil Saya
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowSettings(true)} style={{ color: "#fff" }}>
                <FaKey className="menu-icon" />
                Ganti Password
              </Dropdown.Item>
              <Dropdown.Item style={{ color: "#fff" }}>
                <FaCog className="menu-icon" />
                Pengaturan
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="logout-item" style={{ color: "#dc3545", fontWeight: 700 }}>
                <FaSignOutAlt className="menu-icon" />
                Keluar
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </nav>

      {/* Profile Modal */}
      <Modal
        show={showProfile}
        onHide={() => setShowProfile(false)}
        centered
        className="dark-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Profil Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="profile-modal-content">
            <div className="profile-avatar-large">
              {admin.name.charAt(0).toUpperCase()}
              <div className="online-status"></div>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <FaUserEdit className="detail-icon" />
                <div>
                  <div className="detail-label">Nama</div>
                  <div className="detail-value">{admin.name}</div>
                </div>
              </div>
              <div className="detail-item">
                <FaEnvelope className="detail-icon" />
                <div>
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{admin.email}</div>
                </div>
              </div>
              <div className="detail-item">
                <FaPhone className="detail-icon" />
                <div>
                  <div className="detail-label">Telepon</div>
                  <div className="detail-value">{admin.phone}</div>
                </div>
              </div>
              <div className="detail-item">
                <FaUserShield className="detail-icon" />
                <div>
                  <div className="detail-label">Role</div>
                  <div className="detail-value">
                    <Badge bg={admin.role === 'admin' ? 'primary' : 'secondary'}>
                      {admin.role}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="detail-item">
                <FaCog className="detail-icon" />
                <div>
                  <div className="detail-label">Terakhir Login</div>
                  <div className="detail-value">{formatLastLogin(admin.lastLogin)}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-light"
            onClick={() => setShowProfile(false)}
          >
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        show={showSettings}
        onHide={() => {
          setShowSettings(false);
          setAlert({ show: false, message: "", variant: "" });
          setPasswordForm({ old: "", new: "", confirm: "" });
        }}
        centered
        className="dark-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ganti Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alert.show && (
            <Alert variant={alert.variant} className="mb-3">
              {alert.message}
            </Alert>
          )}
          <Form onSubmit={handleChangePassword}>
            <Form.Group className="mb-3">
              <Form.Label>Password Lama</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.old}
                onChange={e => setPasswordForm({ ...passwordForm, old: e.target.value })}
                placeholder="Masukkan password lama"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password Baru</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.new}
                onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                placeholder="Masukkan password baru"
                required
                minLength={6}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Konfirmasi Password Baru</Form.Label>
              <Form.Control
                type="password"
                value={passwordForm.confirm}
                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                placeholder="Konfirmasi password baru"
                required
                minLength={6}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
              className="w-100 mt-3"
              disabled={!passwordForm.old || !passwordForm.new || !passwordForm.confirm}
            >
              Simpan Perubahan
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminNavbar;