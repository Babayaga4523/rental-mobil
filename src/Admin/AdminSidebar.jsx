import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaCar, FaUsers, FaFileInvoice, FaTachometerAlt, FaChartBar, FaBars, FaTimes, FaCommentDots, FaSignOutAlt } from "react-icons/fa";
import "./AdminSidebar.css";

const menuItems = [
  { path: "/admin", icon: <FaTachometerAlt />, label: "Dashboard" },
  { path: "/admin/orders", icon: <FaFileInvoice />, label: "Pesanan" },
  { path: "/admin/cars", icon: <FaCar />, label: "Mobil" },
  { path: "/admin/users", icon: <FaUsers />, label: "Pengguna" },
  { path: "/admin/report", icon: <FaChartBar />, label: "Laporan" },
  { path: "/admin/testimoni", icon: <FaCommentDots />, label: "Balas Testimoni" }
];

const AdminSidebar = ({ sidebarCollapsed, setSidebarCollapsed, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar when switching to mobile
      if (mobile && !sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setSidebarOpen]);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    if (!sidebarOpen || !isMobile) return;
    
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [sidebarOpen, setSidebarOpen, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Tambahkan fungsi logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminEmail");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-title" onClick={() => navigate("/")}>
            <FaTachometerAlt className="sidebar-icon" />
            {!sidebarCollapsed && <span className="sidebar-label">Admin Panel</span>}
          </div>
          
          {!isMobile && (
            <button 
              className="sidebar-collapse-btn btn-toggle" 
              onClick={toggleSidebar}
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <FaBars /> : <FaTimes />}
            </button>
          )}
        </div>

        {/* Sidebar Menu */}
        <div className="sidebar-menu">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => isMobile && setSidebarOpen(false)}
              end={item.path === "/admin"}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          ))}

          {/* Tambahkan tombol Logout di bawah menu */}
          <button
            className="sidebar-link logout-btn"
            onClick={handleLogout}
            style={{
              width: '100%',
              border: 'none',
              background: 'none',
              display: 'flex',
              alignItems: 'center',
              padding: '0.85rem 1.2rem',
              color: '#e74c3c',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '2rem'
            }}
          >
            <span className="sidebar-icon"><FaSignOutAlt /></span>
            {!sidebarCollapsed && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar when switching to desktop
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Mobile menu button */}
      {isMobile && (
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>
      )}

      <main 
        className="admin-content"
        style={{
          marginLeft: isMobile 
            ? 0 
            : sidebarCollapsed 
              ? '70px' 
              : '260px',
          paddingTop: '70px'
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;