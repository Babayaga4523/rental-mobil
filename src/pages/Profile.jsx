import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle, FaEnvelope, FaPhoneAlt, FaCheckCircle } from "react-icons/fa";
import "../style/Profil.css";
const BACKEND_URL = "http://localhost:3000";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    no_telp: "",
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Ambil data user dari localStorage
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (userId && token) {
      axios
        .get(`${BACKEND_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [userId, token]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    try {
      await axios.put(
        `${BACKEND_URL}/api/users/${userId}`,
        {
          nama: user.name,
          email: user.email,
          no_telp: user.no_telp,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Profil berhasil diperbarui!");
      // Update localStorage user
      localStorage.setItem("user", JSON.stringify({ ...user, name: user.name }));
    } catch (err) {
      setError("Gagal memperbarui profil.");
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <div className="profile-card bg-white shadow rounded-4 p-4" style={{ maxWidth: 420, width: "100%" }}>
        <div className="text-center mb-4">
          <FaUserCircle size={72} className="text-primary mb-2" />
          <h2 className="fw-bold mb-1 text-gradient-primary">Edit Profil</h2>
          <div className="text-muted small mb-2">Kelola data akun Anda dengan mudah dan aman</div>
        </div>
        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2 py-2">
            <FaCheckCircle className="me-2" /> {success}
          </div>
        )}
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-3">
            <label className="form-label fw-bold">
              <FaUserCircle className="me-2 text-primary" />
              Nama
            </label>
            <input
              type="text"
              className="form-control form-control-lg rounded-pill"
              name="name"
              value={user.name || ""}
              onChange={handleChange}
              required
              placeholder="Nama lengkap"
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">
              <FaEnvelope className="me-2 text-primary" />
              Email
            </label>
            <input
              type="email"
              className="form-control form-control-lg rounded-pill"
              name="email"
              value={user.email || ""}
              onChange={handleChange}
              required
              placeholder="Alamat email aktif"
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold">
              <FaPhoneAlt className="me-2 text-primary" />
              No. Telepon
            </label>
            <input
              type="text"
              className="form-control form-control-lg rounded-pill"
              name="no_telp"
              value={user.no_telp || ""}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill py-3">
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;