import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Register.css';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validasi input nomor telepon (hanya angka)
    if (name === "no_telp" && !/^\d*$/.test(value)) return;

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi password dan konfirmasi
    if (form.password !== form.konfirmasi) {
      toast.error("Password dan konfirmasi tidak sama!");
      return;
    }

    // Validasi panjang password
    if (form.password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.nama,
          email: form.email,
          password: form.password,
          no_telp: form.no_telp
        })
      });

      const data = await response.json();

      if (response.status === 201) {
        toast.success("Registrasi berhasil!");
        setForm({
          nama: "",
          email: "",
          no_telp: "",
          password: "",
          konfirmasi: ""
        });
        // Redirect atau lakukan sesuatu setelah registrasi berhasil
      } else {
        toast.error(data.message || "Registrasi gagal.");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page d-flex justify-content-center align-items-center">
      <ToastContainer />
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
                minLength="6"
                required
              />
              <label htmlFor="floatingPassword">Password</label>
            </div>
            <span 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            >
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
                minLength="6"
                required
              />
              <label htmlFor="floatingKonfirmasi">Konfirmasi Password</label>
            </div>
            <span 
              className="password-toggle" 
              onClick={() => setShowKonfirmasi(!showKonfirmasi)}
              style={{ cursor: 'pointer' }}
            >
              <i className={`bi ${showKonfirmasi ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </span>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 btn-lg rounded-pill"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Sedang memproses...
              </>
            ) : "Daftar"}
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