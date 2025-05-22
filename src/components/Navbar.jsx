import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Navbar.css";

const Navbar = () => {

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
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
    { name: "Gallery", path: "/gallery", icon: "fa-images" }, // <-- gunakan '/gallery' (huruf kecil)
    { name: "Layanan", path: "/layanan", icon: "fa-car" },
    ...(localStorage.getItem("token")
      ? [{ name: "Status Pesanan", path: "/pesanan", icon: "fa-clipboard-list" }]
      : []),
    { name: "Testimoni", path: "/testimoni", icon: "fa-comments" },
  ];

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark fixed-top py-3 ${scrolled ? "navbar-scrolled" : ""} ${mobileMenuOpen ? "mobile-menu-open" : ""}`}>
      <div className="container">
        {/* Brand Logo with Animation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <div className="brand-logo me-2">
              <i className="fas fa-car text-primary"></i>
            </div>
            <span className="brand-text">
              <span className="fw-bold">Premium</span>Rental
            </span>
          </Link>
        </motion.div>

        {/* Mobile Toggle Button */}
        <button
          className={`navbar-toggler ${mobileMenuOpen ? "collapsed" : ""}`}
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Content */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            {navLinks.map((item, index) => (
              <motion.li
                className="nav-item"
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  className={`nav-link position-relative ${location.pathname === item.path ? "active" : ""}`}
                  to={item.path}
                >
                  <i className={`fas ${item.icon} me-2 d-lg-none`}></i>
                  {item.name}
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill me-2">
                    <i className="fas fa-sign-in-alt me-1"></i> Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="btn btn-primary btn-sm rounded-pill">
                    <i className="fas fa-user-plus me-1"></i> Daftar
                  </Link>
                </motion.div>
              </>
            ) : (
              <div className="dropdown">
  <button
    className="btn btn-link text-white dropdown-toggle d-flex align-items-center"
    type="button"
    id="userDropdown"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <div className="user-avatar me-2">
      <i className="fas fa-user-circle"></i>
    </div>
    <span className="d-none d-lg-inline">
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
</div>
            )}
          </div>


        </div>
      </div>
    </nav>
  );
};

export default Navbar;
