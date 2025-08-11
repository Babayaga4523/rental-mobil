import React, { useState, useEffect } from "react";
import {
  FaSignOutAlt, FaBars, FaMoon, FaSun, FaBell,
  FaChevronDown, FaChevronRight, FaCheck, FaTimes, FaTrash,
  FaEnvelope, FaPhone, FaUserShield, FaCog // <-- Tambahkan ini!
} from "react-icons/fa";
import { FiUser, FiLock } from "react-icons/fi";
import {
  Dropdown, Modal, Button,
  Form, Badge, Alert,
  OverlayTrigger, Tooltip
} from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminNavbar.css";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from "./utils/notificationApi";
import { socket } from "./utils/socket";
import { API_URL } from "../utils/api"; // Tambahkan ini di bagian import

// Hapus baris ini:
// const API_URL = "https://uji-coba-production.up.railway.app/api";

const AdminNavbar = ({ toggleSidebar, darkMode, toggleDarkMode }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [admin, setAdmin] = useState({
    id: "",
    name: "Admin",
    email: "admin@email.com",
    no_telp: "-",
    role: "admin",
    lastLogin: new Date().toISOString(),
    avatarColor: "#667eea"
  });
  const [passwordForm, setPasswordForm] = useState({
    old: "",
    new: "",
    confirm: ""
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    no_telp: ""
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Generate random avatar color
  const generateAvatarColor = () => {
    const colors = [
      "#667eea", "#764ba2", "#6B8DD6", "#8E37D7",
      "#4FACFE", "#00F2FE", "#43CBFF", "#38F9D7",
      "#FF758C", "#FF7EB3", "#FF7676", "#FF9068"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

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
            no_telp: res.data.user.no_telp || "-",
            role: res.data.user.role || "admin",
            lastLogin: res.data.user.lastLogin || new Date().toISOString(),
            avatarColor: generateAvatarColor()
          });
        }
      } catch (err) {
        setAdmin({
          ...admin,
          name: localStorage.getItem("adminName") || "Admin",
          email: localStorage.getItem("adminEmail") || "admin@email.com",
          avatarColor: generateAvatarColor()
        });
      }
    };
    fetchAdmin();
    // eslint-disable-next-line
  }, []);

  // Fetch notifications
  useEffect(() => {
    const getNotif = async () => {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
      setUnreadCount((res.data || []).filter(n => !n.read).length);
    };
    getNotif();
    // polling setiap 30 detik
    const interval = setInterval(getNotif, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Listener notifikasi baru
  useEffect(() => {
    // Notifikasi umum
    socket.on("new_notification", () => {
      // Fetch ulang dari backend agar sinkron
      axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setNotifications(res.data || []);
        setUnreadCount((res.data || []).filter(n => !n.read).length);
      });
    });
    // Notifikasi pesanan masuk
    socket.on("new_order", () => {
      axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setNotifications(res.data || []);
        setUnreadCount((res.data || []).filter(n => !n.read).length);
      });
    });
    return () => {
      socket.off("new_notification");
      socket.off("new_order");
    };
  }, [token]);

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
      setAlert({ show: true, message: "New passwords don't match!", variant: "danger" });
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
      setAlert({ show: true, message: "Password changed successfully!", variant: "success" });
      setTimeout(() => {
        setShowSettings(false);
        setPasswordForm({ old: "", new: "", confirm: "" });
        setAlert({ show: false, message: "", variant: "" });
      }, 1500);
    } catch (err) {
      setAlert({
        show: true,
        message: err.response?.data?.message || "Failed to change password",
        variant: "danger"
      });
    }
  };

  // Hapus semua notifikasi (panggil API, lalu fetch ulang dari backend)
  const handleDeleteAllNotifications = async () => {
    try {
      await deleteAllNotifications(token);
      // Fetch ulang dari backend agar benar-benar kosong
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
      setUnreadCount(0);
    } catch (err) {
      setAlert({
        show: true,
        message: "Failed to delete all notifications",
        variant: "danger"
      });
    }
  };

  // Hapus satu notifikasi (panggil API, lalu fetch ulang dari backend)
  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id, token);
      // Fetch ulang dari backend agar sinkron
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
      setUnreadCount((res.data || []).filter(n => !n.read).length);
      if (expandedNotification === id) setExpandedNotification(null);
    } catch (err) {
      setAlert({
        show: true,
        message: "Failed to delete notification",
        variant: "danger"
      });
    }
  };

  // Tandai satu notifikasi sebagai sudah dibaca (API, lalu fetch ulang)
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id, token);
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
      setUnreadCount((res.data || []).filter(n => !n.read).length);
    } catch (err) {
      // error handling
    }
  };

  // Tandai semua notifikasi sebagai sudah dibaca (API, lalu fetch ulang)
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(token);
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
      setUnreadCount(0);
    } catch (err) {
      setAlert({
        show: true,
        message: "Failed to mark all as read",
        variant: "danger"
      });
    }
  };

  // Toggle expand notifikasi
  const toggleNotification = (id) => {
    if (expandedNotification === id) {
      setExpandedNotification(null);
    } else {
      setExpandedNotification(id);
      handleMarkAsRead(id);
    }
  };

  // Format last login time
  const formatLastLogin = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format notification time
  const formatNotificationTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleEditProfile = () => {
    setEditForm({
      name: admin.name,
      email: admin.email,
      no_telp: admin.no_telp
    });
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/users/${admin.id}`,
        {
          nama: editForm.name,
          email: editForm.email,
          no_telp: editForm.no_telp
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdmin(prev => ({
        ...prev,
        name: editForm.name,
        email: editForm.email,
        no_telp: editForm.no_telp
      }));
      setEditMode(false);
      setAlert({ show: true, message: "Profile updated successfully!", variant: "success" });
    } catch (err) {
      setAlert({
        show: true,
        message: err.response?.data?.message || "Failed to update profile",
        variant: "danger"
      });
    }
  };

  return (
    <>
      <nav className="admin-navbar">
        {/* Left Section */}
        <div className="navbar-left">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="sidebar-tooltip">Toggle Sidebar</Tooltip>}
          >
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
          </OverlayTrigger>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Dark Mode Toggle */}
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="theme-tooltip">
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </Tooltip>}
          >
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </OverlayTrigger>

          {/* Notifications Bell Button */}
          <Dropdown className="notifications-dropdown d-flex align-items-center" align="end">
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="notif-tooltip">Notifications</Tooltip>}
            >
              <Dropdown.Toggle
                as="button"
                className="notification-toggle btn btn-link p-0 d-flex align-items-center"
                id="notifDropdown"
                style={{ outline: "none" }}
              >
                <div className="d-flex align-items-center">
                  <div className="notification-icon-wrapper me-1">
                    <FaBell />
                    {unreadCount > 0 && (
                      <span className="notification-badge">{unreadCount}</span>
                    )}
                  </div>
                </div>
              </Dropdown.Toggle>
            </OverlayTrigger>

            <Dropdown.Menu
              className="notification-menu"
              align="end"
            >
              <div className="notification-header">
                <h5>Notifications ({notifications.length})</h5>
                <div className="notification-actions">
                  {unreadCount > 0 && (
                    <button
                      className="mark-all-read"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    className="clear-all"
                    onClick={handleDeleteAllNotifications}
                  >
                    Clear all
                    </button>
                </div>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <div className="empty-icon">
                      <FaBell />
                    </div>
                    <p>No notifications yet</p>
                    <small>You'll see important updates here</small>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`notification-item ${!notification.read ? 'unread' : ''} ${
                        expandedNotification === notification.id ? 'expanded' : ''
                      }`}
                    >
                      <div
                        className="notification-content"
                        onClick={() => toggleNotification(notification.id)}
                      >
                        <div className="notification-icon">
                          <div className={`icon-bg ${notification.type || 'default'}`}>
                            {notification.type === 'warning' ? (
                              <FaTimes />
                            ) : notification.type === 'success' ? (
                              <FaCheck />
                            ) : (
                              <FaBell />
                            )}
                          </div>
                        </div>
                        <div className="notification-details">
                          <div className="notification-title">
                            {notification.title || 'Notification'}
                          </div>
                          <div className="notification-message">
                            {notification.message}
                          </div>
                          <div className="notification-time">
                            {formatNotificationTime(notification.createdAt)}
                          </div>
                        </div>
                        <div className="notification-chevron">
                          {expandedNotification === notification.id ? (
                            <FaChevronDown />
                          ) : (
                            <FaChevronRight />
                          )}
                        </div>
                      </div>

                      {expandedNotification === notification.id && (
                        <div className="notification-expanded">
                          <div className="notification-full-message">
                            {notification.message}
                          </div>
                          <div className="notification-actions">
                            <button
                              className="delete-notification"
                              onClick={e => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}              </div>
              <div className="notification-footer">
                <button className="view-all">
                  View all notifications
                </button>
              </div>
            </Dropdown.Menu>
          </Dropdown>

          {/* User Profile Dropdown */}
          <Dropdown className="profile-dropdown" align="end">
            <Dropdown.Toggle className="profile-toggle">
              <div
                className="profile-avatar"
                style={{ backgroundColor: admin.avatarColor }}
              >
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <div className="profile-name">{admin.name}</div>
                <div className="profile-role">{admin.role}</div>
              </div>
              <FaChevronDown className="profile-chevron" />
            </Dropdown.Toggle>

            <Dropdown.Menu className="profile-menu">
              <Dropdown.Header className="profile-menu-header">
                <div
                  className="menu-avatar"
                  style={{ backgroundColor: admin.avatarColor }}
                >
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="menu-profile-info">
                  <div className="menu-profile-name">{admin.name}</div>
                  <div className="menu-profile-email">{admin.email}</div>
                </div>
              </Dropdown.Header>

              <Dropdown.Item
                className="profile-menu-item"
                onClick={() => setShowProfile(true)}
              >
                <FiUser className="menu-icon" />
                <span>My Profile</span>
              </Dropdown.Item>

              <Dropdown.Item
                className="profile-menu-item"
                onClick={() => setShowSettings(true)}
              >
                <FiLock className="menu-icon" />
                <span>Change Password</span>
              </Dropdown.Item>

              <Dropdown.Divider />
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </nav>

      {/* Profile Modal */}
      <Modal
        show={showProfile}
        onHide={() => {
          setShowProfile(false);
          setEditMode(false);
          setAlert({ show: false, message: "", variant: "" });
        }}
        centered
        className="admin-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FiUser className="modal-title-icon fs-4 text-primary" />
            <span className="fw-semibold">Admin Profile</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column align-items-center mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center shadow"
              style={{
                width: 90,
                height: 90,
                backgroundColor: admin.avatarColor,
                fontSize: 38,
                color: "#fff",
                marginBottom: 8
              }}
            >
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <span className="badge bg-success mb-2">Online</span>
          </div>

          {alert.show && (
            <Alert variant={alert.variant} className="mb-3 w-100 text-center">
              {alert.message}
            </Alert>
          )}

          {!editMode ? (
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <FiUser className="me-2 text-primary" />
                  <span className="fw-bold">Name:</span>
                </div>
                <div className="ps-4">{admin.name}</div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <FaEnvelope className="me-2 text-primary" />
                  <span className="fw-bold">Email:</span>
                </div>
                <div className="ps-4">{admin.email}</div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <FaPhone className="me-2 text-primary" />
                  <span className="fw-bold">Phone:</span>
                </div>
                <div className="ps-4">{admin.no_telp}</div>
              </div>
              <div className="col-12 col-md-6">
                <div className="d-flex align-items-center mb-2">
                  <FaUserShield className="me-2 text-primary" />
                  <span className="fw-bold">Role:</span>
                </div>
                <div className="ps-4">
                  <Badge bg="primary" pill className="px-3 py-1 text-capitalize">
                    {admin.role}
                  </Badge>
                </div>
              </div>
              <div className="col-12">
                <div className="d-flex align-items-center mb-2">
                  <FaCog className="me-2 text-primary" />
                  <span className="fw-bold">Last Login:</span>
                </div>
                <div className="ps-4">{formatLastLogin(admin.lastLogin)}</div>
              </div>
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  autoFocus
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.no_telp}
                  onChange={e => setEditForm({ ...editForm, no_telp: e.target.value })}
                  required
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={() => {
              setShowProfile(false);
              setEditMode(false);
              setAlert({ show: false, message: "", variant: "" });
            }}
          >
            Close
          </Button>
          {!editMode ? (
            <Button variant="primary" onClick={handleEditProfile}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="success" onClick={handleSaveProfile}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </>
          )}
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
        className="admin-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FiLock className="modal-title-icon" />
            Change Password
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alert.show && (
            <Alert variant={alert.variant} className="mb-4">
              {alert.message}
            </Alert>
          )}
          <Form onSubmit={handleChangePassword}>
            <Form.Group className="mb-3 form-group-custom">
              <Form.Label>Current Password</Form.Label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <Form.Control
                  type="password"
                  value={passwordForm.old}
                  onChange={e => setPasswordForm({ ...passwordForm, old: e.target.value })}
                  placeholder="Enter your current password"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3 form-group-custom">
              <Form.Label>New Password</Form.Label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <Form.Control
                  type="password"
                  value={passwordForm.new}
                  onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <Form.Text className="text-muted">
                Minimum 6 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4 form-group-custom">
              <Form.Label>Confirm New Password</Form.Label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <Form.Control
                  type="password"
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 submit-btn"
              disabled={!passwordForm.old || !passwordForm.new || !passwordForm.confirm}
            >
              Change Password
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdminNavbar;