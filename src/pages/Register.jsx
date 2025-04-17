import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Register.css';

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.konfirmasi) {
      alert("Password tidak sama!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama: form.nama,
          email: form.email,
          no_telp: form.no_telp,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registrasi berhasil!");
        setForm({
          nama: "",
          email: "",
          no_telp: "",
          password: "",
          konfirmasi: ""
        });
      } else {
        alert(data.message || "Registrasi gagal.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Terjadi kesalahan pada server.");
    }
  };

  return (
    <div className="register-page d-flex justify-content-center align-items-center">
      <div className="glass-card p-5 shadow">
        <div className="text-center mb-4">
          <img src="/assets/logo-pawon.png" alt="Logo" className="register-logo mb-3" />
          <h2 className="fw-bold text-dark">Daftar Akun</h2>
          <p className="text-muted">Lengkapi data untuk mendaftar akun baru</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              name="nama"
              className="form-control"
              id="floatingNama"
              placeholder="Nama Lengkap"
              value={form.nama}
              onChange={handleChange}
              required
            />
            <label htmlFor="floatingNama">Nama Lengkap</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="email"
              name="email"
              className="form-control"
              id="floatingEmail"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="floatingEmail">Email</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="tel"
              name="no_telp"
              className="form-control"
              id="floatingTelepon"
              placeholder="Nomor Telepon"
              value={form.no_telp}
              onChange={handleChange}
              required
            />
            <label htmlFor="floatingTelepon">Nomor Telepon</label>
          </div>
          <div className="position-relative mb-3">
            <div className="form-floating">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-control"
                id="floatingPassword"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <label htmlFor="floatingPassword">Password</label>
            </div>
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </span>
          </div>
          <div className="position-relative mb-4">
            <div className="form-floating">
              <input
                type={showKonfirmasi ? "text" : "password"}
                name="konfirmasi"
                className="form-control"
                id="floatingKonfirmasi"
                placeholder="Konfirmasi Password"
                value={form.konfirmasi}
                onChange={handleChange}
                required
              />
              <label htmlFor="floatingKonfirmasi">Konfirmasi Password</label>
            </div>
            <span className="password-toggle" onClick={() => setShowKonfirmasi(!showKonfirmasi)}>
              <i className={`bi ${showKonfirmasi ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </span>
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill">
            Daftar
          </button>
        </form>
        <div className="text-center mt-3">
          <small className="text-muted">
            Sudah punya akun? <a href="/login" className="text-primary">Masuk</a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Register;
