import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../style/Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Cek jika sudah login
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(location.state?.from || '/home');
    }
  }, [navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validasi input
    if (!email.trim() || !password) {
      toast.error('Harap isi email dan password', { position: 'top-center' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      // Simpan token dan user data di localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token_expiry', Date.now() + 24 * 60 * 60 * 1000); // Token kadaluarsa 24 jam

      toast.success('Login berhasil!');

      // Redirect berdasarkan role
      const redirectPath = location.state?.from ||
        (data.user.role === 'admin' ? '/admin' : '/home');
      
      navigate(redirectPath, {
        state: { 
          user: data.user,
          from: location.pathname
        }
      });

    } catch (error) {
      console.error('Login error:', error);

      // Handle error spesifik
      if (error.message.includes('401')) {
        toast.error('Email atau password salah');
      } else if (error.message.includes('403')) {
        toast.error('Akun belum aktif');
      } else if (error.message.includes('Network Error')) {
        toast.error('Tidak dapat terhubung ke server');
      } else {
        toast.error(error.message || 'Terjadi kesalahan saat login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <ToastContainer />
      <div className="login-card">
        <div className="logo-container">
          <img src="/assets/logo-pawon.png" alt="Logo" className="logo" />
          <div className="app-name">Pawon</div>
        </div>

        <div className="header">
          <h2>Selamat Datang Kembali</h2>
          <p>Masuk untuk melanjutkan ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Alamat Email</label>
            <input
              type="email"
              id="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Memproses...
              </>
            ) : "Masuk Sekarang"}
          </button>
        </form>

        <div className="footer">
          <span>Belum punya akun?</span>
          <a href="/register">Daftar di sini</a>
        </div>
      </div>
    </div>
  );
};

export default Login;