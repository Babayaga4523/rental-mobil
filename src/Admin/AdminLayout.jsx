import React, { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);
  const toggleDarkMode = () => setDarkMode((v) => !v);

  return (
    <div className={`admin-root${darkMode ? " dark" : ""}`}>
      <AdminNavbar
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <AdminSidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        darkMode={darkMode}
      />
      <main className={`admin-content${sidebarCollapsed ? " collapsed" : ""}`}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;