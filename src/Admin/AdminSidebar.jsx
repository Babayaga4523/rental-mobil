import React from "react";
import { NavLink } from "react-router-dom";
import { FaCar, FaUsers, FaFileInvoice, FaTachometerAlt, FaChartBar } from "react-icons/fa";

const AdminSidebar = ({ sidebarCollapsed }) => (
  <aside
    className="main-sidebar sidebar-dark-primary elevation-4"
    style={{
      width: sidebarCollapsed ? 60 : 220,
      transition: "width 0.2s",
      position: "fixed",
      height: "100vh",
      zIndex: 1000,
      background: "#23272b",
      color: "#fff",
      boxShadow: "2px 0 8px rgba(0,0,0,0.08)"
    }}
  >
    <div
      className="brand-link text-center py-3"
      style={{
        fontSize: 20,
        color: "#fff",
        letterSpacing: 1,
        borderBottom: "1px solid #333",
        background: "#23272b"
      }}
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
            >
              <FaChartBar className="nav-icon" />
              <span style={{
                display: sidebarCollapsed ? "none" : "inline",
                marginLeft: 10
              }}>Laporan</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
);

export default AdminSidebar;