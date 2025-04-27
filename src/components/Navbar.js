import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Navbar.css"; // Add custom styles

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
    // Clear token and user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold fs-4 text-light" to="/">
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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-5">
            {[{ name: "Home", path: "/" }, { name: "Tentang Kami", path: "/about" }, { name: "Layanan", path: "/layanan" }, { name: "Testimoni", path: "/testimoni" }].map((item, index) => (
              <li className="nav-item" key={index}>
                <Link
                  className="nav-link"
                  to={item.path}
                  style={{ fontWeight: "500", transition: "all 0.3s ease" }}
                >
                  {item.name}
                </Link>
              </li>
            ))}

            {/* Conditional Login/Logout */}
            {!localStorage.getItem("token") ? (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
            ) : (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link text-danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            )}
          </ul>

          {/* Search Form */}
          <form className="d-flex ms-lg-5" onSubmit={handleSearch}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Cari mobil..."
              aria-label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ borderRadius: "30px", width: "300px" }}
            />
            <button className="btn btn-outline-light" type="submit" style={{ borderRadius: "30px" }}>
              Cari
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
