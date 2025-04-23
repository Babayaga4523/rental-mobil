import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${searchQuery}`);
    }
  };

  // Logout handler
  const handleLogout = () => {
    // Hapus token dan data user dari localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect ke halaman login
    navigate('/login');
  };

  const linkStyle = {
    color: "#212529",
    padding: "0.5rem 1rem",
    fontWeight: "500",
    transition: "all 0.3s ease",
    textDecoration: "none",
  };

  const hoverStyle = {
    color: "#0d6efd",
    fontWeight: "600",
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-light shadow-sm py-3"
      style={{ fontFamily: "Segoe UI, sans-serif" }}
    >
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold fs-4 text-dark" to="/">
          🚗 Rental Mobil
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {[{ name: "Home", path: "/" }, { name: "Tentang Kami", path: "/about" }, { name: "Layanan", path: "/layanan" }, { name: "Testimoni", path: "/testimoni" }].map((item, index) => (
              <li className="nav-item" key={index}>
                <Link
                  className="nav-link"
                  to={item.path}
                  style={linkStyle}
                  onMouseEnter={(e) => Object.assign(e.target.style, hoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.target.style, linkStyle)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            
            {/* Conditional Login/Logout */}
            {!localStorage.getItem('token') ? (
              <li className="nav-item">
                <Link className="nav-link" to="/login" style={linkStyle}>Login</Link>
              </li>
            ) : (
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={handleLogout} style={{ ...linkStyle, color: 'red' }}>
                  Logout
                </button>
              </li>
            )}
          </ul>

          {/* Form Search */}
          <form className="d-flex" onSubmit={handleSearch}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Cari mobil..."
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-outline-success" type="submit">
              Cari
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
