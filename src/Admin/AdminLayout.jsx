import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = ({ children, darkMode, toggleDarkMode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen((open) => !open);
    } else {
      setSidebarCollapsed((collapsed) => !collapsed);
    }
  };

  return (
    <>
      <AdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <AdminNavbar
        toggleSidebar={handleSidebarToggle}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <div
        style={{
          marginLeft: isMobile ? 0 : sidebarCollapsed ? 60 : 220,
          paddingTop: 70,
          transition: "margin-left 0.2s",
        }}
      >
        {children}
      </div>
    </>
  );
};

export default AdminLayout;