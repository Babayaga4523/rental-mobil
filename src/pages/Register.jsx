import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Register.css';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

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

  // Membersihkan notifikasi saat komponen tidak lagi digunakan
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  const showNotification = (type, message) => {
    // Menutup notifikasi yang ada
    toast.dismiss();
    
    // Pengaturan notifikasi
    const options = {
      position: "top-center",
      autoClose: type === 'error' ? 5000 : 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    };

    if (type === 'error') {
      toast.error(message, options);
    } else {
      toast.success(message, options);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validasi khusus untuk nomor telepon
    if (name === "no_telp" && !/^\d*$/.test(value)) {
      setErrors({...errors, no_telp: "Nomor telepon hanya boleh mengandung angka"});
      showNotification('error', "Nomor telepon hanya boleh mengandung angka");
      return;
    } else {
      setErrors({...errors, no_telp: ""});
    }

    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validasi nama
    if (!form.nama.trim()) {
      newErrors.nama = "Nama lengkap harus diisi";
      isValid = false;
    }

    // Validasi email
    if (!form.email.trim()) {
      newErrors.email = "Email harus diisi";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
      isValid = false;
    }

    // Validasi nomor telepon
    if (!form.no_telp.trim()) {
      newErrors.no_telp = "Nomor telepon harus diisi";
      isValid = false;
    } else if (form.no_telp.length < 10 || form.no_telp.length > 13) {
      newErrors.no_telp = "Nomor telepon harus 10-13 digit";
      isValid = false;
    }

    // Validasi password
    if (!form.password) {
      newErrors.password = "Password harus diisi";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
      isValid = false;
    }

    // Validasi konfirmasi password
    if (form.password !== form.konfirmasi) {
      newErrors.konfirmasi = "Password dan konfirmasi tidak sama";
      isValid = false;
    }

    setErrors(newErrors);

    // Tampilkan notifikasi error pertama yang ditemukan
    if (!isValid) {
      const firstError = Object.values(newErrors).find(msg => msg);
      if (firstError) {
        showNotification('error', firstError);
      }
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi form sebelum submit
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Kirim data ke API
      const response = await fetch("http://localhost:3000/api/auth/register", {
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

      // Handle response error
      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal");
      }

      // Tampilkan notifikasi sukses
      showNotification('success', "Registrasi berhasil! Mengarahkan ke halaman login...");
      
      // Reset form
      setForm({
        nama: "",
        email: "",
        no_telp: "",
        password: "",
        konfirmasi: ""
      });

      // Redirect ke halaman login setelah 3 detik
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      console.error("Error:", err);
      showNotification('error', err.message || "Terjadi kesalahan pada server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page d-flex justify-content-center align-items-center">
      <div className="glass-card p-4 p-md-5 shadow">
        <div className="text-center mb-4">
          <img 
            src="/assets/logo-pawon.png" 
            alt="Logo" 
            className="register-logo mb-3 img-fluid" 
            style={{ maxHeight: "80px" }}
          />
          <h2 className="fw-bold text-dark">Daftar Akun</h2>
          <p className="text-muted">Lengkapi data untuk mendaftar akun baru</p>
        </div>
        
        <form onSubmit={handleSubmit} noValidate>
          {/* Field Nama */}
          <div className="form-floating mb-3">
            <input
              type="text"
              name="nama"
              className={`form-control ${errors.nama && "is-invalid"}`}
              id="floatingNama"
              placeholder="Nama Lengkap"
              value={form.nama}
              onChange={handleChange}
              required
            />
            <label htmlFor="floatingNama">Nama Lengkap</label>
            {errors.nama && <div className="invalid-feedback">{errors.nama}</div>}
          </div>

          {/* Field Email */}
          <div className="form-floating mb-3">
            <input
              type="email"
              name="email"
              className={`form-control ${errors.email && "is-invalid"}`}
              id="floatingEmail"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="floatingEmail">Email</label>
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          {/* Field Nomor Telepon */}
          <div className="form-floating mb-3">
            <input
              type="tel"
              name="no_telp"
              className={`form-control ${errors.no_telp && "is-invalid"}`}
              id="floatingTelepon"
              placeholder="Nomor Telepon"
              value={form.no_telp}
              onChange={handleChange}
              required
            />
            <label htmlFor="floatingTelepon">Nomor Telepon</label>
            {errors.no_telp && <div className="invalid-feedback">{errors.no_telp}</div>}
          </div>

          {/* Field Password */}
          <div className="position-relative mb-3">
            <div className="form-floating">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`form-control ${errors.password && "is-invalid"}`}
                id="floatingPassword"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                minLength="6"
                required
              />
              <label htmlFor="floatingPassword">Password</label>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
            <span 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </span>
          </div>

          {/* Field Konfirmasi Password */}
          <div className="position-relative mb-4">
            <div className="form-floating">
              <input
                type={showKonfirmasi ? "text" : "password"}
                name="konfirmasi"
                className={`form-control ${errors.konfirmasi && "is-invalid"}`}
                id="floatingKonfirmasi"
                placeholder="Konfirmasi Password"
                value={form.konfirmasi}
                onChange={handleChange}
                minLength="6"
                required
              />
              <label htmlFor="floatingKonfirmasi">Konfirmasi Password</label>
              {errors.konfirmasi && <div className="invalid-feedback">{errors.konfirmasi}</div>}
            </div>
            <span 
              className="password-toggle" 
              onClick={() => setShowKonfirmasi(!showKonfirmasi)}
              style={{ cursor: 'pointer' }}
            >
              <i className={`bi ${showKonfirmasi ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </span>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            className="btn btn-primary w-100 btn-lg rounded-pill py-3"
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

        {/* Link ke Login */}
        <div className="text-center mt-3">
          <small className="text-muted">
            Sudah punya akun? <a href="/login" className="text-primary text-decoration-none">Masuk</a>
          </small>
        </div>
      </div>
      
      {/* Container untuk Notifikasi */}
      <ToastContainer 
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={1}
        theme="light"
      />
    </div>
  );
};

export default Register;