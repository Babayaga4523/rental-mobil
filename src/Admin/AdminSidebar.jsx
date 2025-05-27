import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaCar, FaUsers, FaFileInvoice, FaTachometerAlt, FaChartBar, FaBars, FaCommentDots } from "react-icons/fa";
import AdminNavbar from "./AdminNavbar"; // Tambahkan ini di paling atas

const AdminSidebar = ({ sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef();

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sidebarOpen, setSidebarOpen]);

  // Responsive sidebar style
  const isMobile = window.innerWidth <= 768;
  const showSidebar = isMobile ? sidebarOpen : true;

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.3)",
            zIndex: 999
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        className="main-sidebar sidebar-dark-primary elevation-4"
        style={{
          width: sidebarCollapsed ? 60 : 220,
          transition: "width 0.2s",
          position: "fixed",
          height: "100vh",
          zIndex: 1000,
          background: "#23272b",
          color: "#fff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
          left: showSidebar ? 0 : isMobile ? -240 : 0,
          top: 0,
          display: showSidebar ? "block" : "none"
        }}
      >
      
      {/* Brand Admin, klik ke home */}
      <div
        className="brand-link text-center py-3"
        style={{
          fontSize: 20,
          color: "#fff",
          letterSpacing: 1,
          borderBottom: "1px solid #333",
          background: "#23272b",
          cursor: "pointer"
        }}
        onClick={() => navigate("/")}
        title="Kembali ke Home"
      >
        <span className="brand-text fw-bold">
          <FaTachometerAlt className="me-2" />
          {sidebarCollapsed ? "" : "Admin"}
        </span>
      </div>
      <div className="sidebar">
        <nav className="mt-4">
          <ul className="nav nav-pills nav-sidebar flex-column" role="menu">
            <li className="nav-item">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                style={({ isActive }) => ({
                  background: isActive ? "#0d6efd" : "transparent",
                  color: isActive ? "#fff" : "#adb5bd",
                  fontWeight: isActive ? "bold" : "normal"
                })}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <FaTachometerAlt className="nav-icon" />
                <span style={{
                  display: sidebarCollapsed ? "none" : "inline",
                  marginLeft: 10
                }}>Dashboard</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                style={({ isActive }) => ({
                  background: isActive ? "#0d6efd" : "transparent",
                  color: isActive ? "#fff" : "#adb5bd",
                  fontWeight: isActive ? "bold" : "normal"
                })}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <FaFileInvoice className="nav-icon" />
                <span style={{
                  display: sidebarCollapsed ? "none" : "inline",
                  marginLeft: 10
                }}>Pesanan</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admin/cars"
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                style={({ isActive }) => ({
                  background: isActive ? "#0d6efd" : "transparent",
                  color: isActive ? "#fff" : "#adb5bd",
                  fontWeight: isActive ? "bold" : "normal"
                })}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <FaCar className="nav-icon" />
                <span style={{
                  display: sidebarCollapsed ? "none" : "inline",
                  marginLeft: 10
                }}>Mobil</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                style={({ isActive }) => ({
                  background: isActive ? "#0d6efd" : "transparent",
                  color: isActive ? "#fff" : "#adb5bd",
                  fontWeight: isActive ? "bold" : "normal"
                })}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <FaUsers className="nav-icon" />
                <span style={{
                  display: sidebarCollapsed ? "none" : "inline",
                  marginLeft: 10
                }}>Pengguna</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admin/report"
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                style={({ isActive }) => ({
                  background: isActive ? "#0d6efd" : "transparent",
                  color: isActive ? "#fff" : "#adb5bd",
                  fontWeight: isActive ? "bold" : "normal"
                })}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <FaChartBar className="nav-icon" />
                <span style={{
                  display: sidebarCollapsed ? "none" : "inline",
                  marginLeft: 10
                }}>Laporan</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admin/testimoni"
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                style={({ isActive }) => ({
                  background: isActive ? "#0d6efd" : "transparent",
                  color: isActive ? "#fff" : "#adb5bd",
                  fontWeight: isActive ? "bold" : "normal"
                })}
                onClick={() => isMobile && setSidebarOpen(false)}
              >
                <FaCommentDots className="nav-icon" />
                <span style={{
                  display: sidebarCollapsed ? "none" : "inline",
                  marginLeft: 10
                }}>Balas Testimoni</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
    </>
  );
};

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toggle sidebar: collapse di desktop, open/close di mobile
  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen((open) => !open);
    } else {
      setSidebarCollapsed((collapsed) => !collapsed);
    }
  };

  return (
    <>
      <AdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <AdminNavbar
        toggleSidebar={handleSidebarToggle}
        // ...props lain...
      />
      <div style={{
        marginLeft: window.innerWidth > 768
          ? (sidebarCollapsed ? 60 : 220)
          : 0,
        paddingTop: 70,
        transition: "margin-left 0.2s"
      }}>
        {children}
      </div>
      <button className="sidebar-toggle" onClick={handleSidebarToggle}>
        <FaBars />
      </button>
    </>
  );
};

export default AdminLayout;