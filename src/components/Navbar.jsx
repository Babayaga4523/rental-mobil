import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css";
import { API_URL } from "../utils/api"; // Tambahkan ini

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Tentang Kami", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Layanan", path: "/layanan" },
    ...(localStorage.getItem("token")
      ? [{ name: "Status Pesanan", path: "/pesanan" }]
      : []),
    { name: "Testimoni", path: "/testimoni" },
  ];

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const photoUrl = user?.photo
    ? user.photo.startsWith("/uploads/")
      ? `${API_URL.replace(/\/api$/, "")}${user.photo}`
      : user.photo
    : "/images/default-avatar.png";

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-3" to="/">
          <span className="brand-logo-glow">
            <img
              src="/images/logo.png"
              alt="Logo Rental Mobil"
              className="brand-logo-img"
            />
          </span>
          <span className="brand-text">
            <span className="fw-bold">Rental</span>HS
          </span>
        </Link>

        {/* Hamburger */}
        <button
          className={`navbar-toggler${mobileMenuOpen ? "" : " collapsed"}`}
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <div className="hamburger">
            <span />
            <span />
            <span />
          </div>
        </button>

        {/* Navigation */}
        <div className={`collapse navbar-collapse${mobileMenuOpen ? " show" : ""}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {navLinks.map((item, index) => (
              <li
                className="nav-item"
                key={index}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}
              >
                <Link
                  className={`nav-link position-relative ${location.pathname === item.path ? "active" : ""}`}
                  to={item.path}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth Section */}
          <div className="d-flex align-items-center auth-section">
            {!localStorage.getItem("token") ? (
              <>
                <Link to="/login" className="btn login-btn me-2">
                  Login
                </Link>
                <Link to="/register" className="btn register-btn">
                  Daftar
                </Link>
              </>
            ) : (
              <div className="dropdown">
                <button
                  className="btn btn-link text-dark dropdown-toggle d-flex align-items-center user-dropdown-btn px-2 py-1"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="user-avatar me-2">
                    <img
                      src={photoUrl}
                      alt="Foto Profil"
                      style={{
                        width: 32,
                        height: 32,
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "2px solid #e9ecef",
                        background: "#fff"
                      }}
                      onError={e => { e.target.src = "/images/default-avatar.png"; }}
                    />
                  </div>
                  <span className="d-none d-lg-inline user-name-gradient">
                    {JSON.parse(localStorage.getItem("user"))?.name || "My Account"}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      Profil
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;