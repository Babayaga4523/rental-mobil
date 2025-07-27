import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Navbar.css";

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
    { name: "Home", path: "/", icon: "fa-home" },
    { name: "Tentang Kami", path: "/about", icon: "fa-info-circle" },
    { name: "Gallery", path: "/gallery", icon: "fa-images" },
    { name: "Layanan", path: "/layanan", icon: "fa-car" },
    ...(localStorage.getItem("token")
      ? [{ name: "Status Pesanan", path: "/pesanan", icon: "fa-clipboard-list" }]
      : []),
    { name: "Testimoni", path: "/testimoni", icon: "fa-comments" },
  ];

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="container">
        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link className="navbar-brand d-flex align-items-center gap-3" to="/">
            {/* Logo bulat di kiri dengan animasi spin */}
            <motion.span
              className="brand-logo-glow"
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            >
              <img
                src="/images/logo.png"
                alt="Logo Brand"
                className="brand-logo-img"
              />
            </motion.span>
            {/* Teks PremiumRental dengan animasi fade-slide */}
            <motion.span
              className="brand-text d-flex align-items-center gap-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7, type: "spring" }}
            >
              <span className="fw-bold">Rental</span>Hs
              
            </motion.span>
          </Link>
        </motion.div>

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
              <motion.li
                className="nav-item"
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => mobileMenuOpen && setMobileMenuOpen(false)}
              >
                <Link
                  className={`nav-link position-relative ${location.pathname === item.path ? "active" : ""}`}
                  to={item.path}
                >
                  <i className={`fas ${item.icon} me-2 d-lg-none`}></i>
                  {item.name}
                  {hoveredItem === index && (
                    <motion.span
                      className="nav-hover-effect"
                      layoutId="navHover"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {location.pathname === item.path && (
                    <motion.span
                      className="nav-active-indicator"
                      layoutId="navActive"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.li>
            ))}
          </ul>

          {/* Auth Section */}
          <div className="d-flex align-items-center auth-section">
            {!localStorage.getItem("token") ? (
              <>
                <Link to="/login" className="btn login-btn me-2">
                  <i className="fas fa-sign-in-alt me-1"></i> Login
                </Link>
                <Link to="/register" className="btn register-btn">
                  <i className="fas fa-user-plus me-1"></i> Daftar
                </Link>
              </>
            ) : (
              <motion.div
                className="dropdown"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button
                  className="btn btn-link text-white dropdown-toggle d-flex align-items-center user-dropdown-btn px-2 py-1"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="user-avatar me-2">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <span className="d-none d-lg-inline user-name-gradient">
                    {JSON.parse(localStorage.getItem("user"))?.name || "My Account"}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="fas fa-user me-2"></i> Profile
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;