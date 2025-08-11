import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import '../style/Register.css';

import { API_URL } from "../utils/api";

const Register = () => {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_telp: "",
    password: "",
    konfirmasi: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showNotification = (type, message) => {
    const options = {
      autoClose: type === 'error' ? 5000 : 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
      icon: type === "success" ? "🎉" : type === "error" ? "❌" : "ℹ️"
    };
    if (type === 'error') {
      toast.error(message, options);
    } else {
      toast.success(message, options);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "no_telp" && !/^\d*$/.test(value)) {
      setErrors({ ...errors, no_telp: "Nomor telepon hanya boleh angka" });
      showNotification("error", "Nomor telepon hanya boleh angka");
      return;
    } else {
      setErrors({ ...errors, no_telp: "" });
    }

    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!form.nama.trim()) {
      newErrors.nama = "Nama lengkap harus diisi";
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email harus diisi";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
      isValid = false;
    }

    if (!form.no_telp.trim()) {
      newErrors.no_telp = "Nomor telepon harus diisi";
      isValid = false;
    } else if (form.no_telp.length < 10 || form.no_telp.length > 13) {
      newErrors.no_telp = "Nomor telepon harus 10-13 digit";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password harus diisi";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
      isValid = false;
    }

    if (form.password !== form.konfirmasi) {
      newErrors.konfirmasi = "Password dan konfirmasi tidak sama";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      const firstError = Object.values(newErrors).find(msg => msg);
      if (firstError) showNotification("error", firstError);
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const url = `${API_URL}/auth/register`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nama,
          email: form.email,
          password: form.password,
          no_telp: form.no_telp,
        })
      });

      if (!res.ok) {
        let msg = `Gagal (${res.status})`;
        try {
          const data = await res.json();
          msg = data?.message || data?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      showNotification("success", "Registrasi berhasil! Mengarahkan ke login...");
      setForm({ nama: "", email: "", no_telp: "", password: "", konfirmasi: "" });
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      console.error("Error:", err);
      showNotification("error", err.message || "Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" style={{ paddingTop: 100 }}>
      <div className="auth-card">
        <div className="logo-wrapper text-center mb-4">
          <div
            className="logo-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
            style={{
              overflow: "hidden",
              boxShadow: "0 0 32px 6px #00eaff44, 0 0 0 8px #4f46e522"
            }}
          >
            <img
              src="/images/logo.png"
              alt="Logo"
              className="logo-img"
              style={{ width: "60%", height: "60%", objectFit: "contain" }}
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <i className="bi bi-person-plus fs-3" style={{ display: "none" }}></i>
          </div>
          <h2 className="app-title text-gradient">RENTAL HS</h2>
        </div>
        <div className="auth-header text-center mb-4">
          <h3 className="fw-bold mb-2">Daftar Akun</h3>
          <p className="text-muted">Lengkapi data untuk mendaftar akun baru</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="nama" className="form-label">Nama Lengkap</label>
            <input
              type="text"
              name="nama"
              id="nama"
              className={`form-control ${errors.nama && "is-invalid"}`}
              placeholder="Masukkan nama lengkap"
              value={form.nama}
              onChange={handleChange}
            />
            {errors.nama && <div className="error-message">{errors.nama}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              className={`form-control ${errors.email && "is-invalid"}`}
              placeholder="Masukkan email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="no_telp" className="form-label">Nomor Telepon</label>
            <input
              type="tel"
              name="no_telp"
              id="no_telp"
              className={`form-control ${errors.no_telp && "is-invalid"}`}
              placeholder="Masukkan nomor telepon"
              value={form.no_telp}
              onChange={handleChange}
            />
            {errors.no_telp && <div className="error-message">{errors.no_telp}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                className={`form-control ${errors.password ? "is-invalid" : ""}`}
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="konfirmasi" className="form-label">Konfirmasi Password</label>
            <div className="password-wrapper">
              <input
                type={showKonfirmasi ? "text" : "password"}
                name="konfirmasi"
                id="konfirmasi"
                className={`form-control ${errors.konfirmasi ? "is-invalid" : ""}`}
                placeholder="Konfirmasi password"
                value={form.konfirmasi}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle-button"
                onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                aria-label={showKonfirmasi ? "Sembunyikan password" : "Tampilkan password"}
              >
                <i className={showKonfirmasi ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </button>
            </div>
            {errors.konfirmasi && <div className="error-message">{errors.konfirmasi}</div>}
          </div>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Mendaftarkan...
              </>
            ) : "Daftar Sekarang"}
          </button>
        </form>

        <div className="auth-footer">
          Sudah punya akun? <a href="/login" className="auth-link">Masuk di sini</a>
        </div>
      </div>
    </div>
  );
};

export default Register;