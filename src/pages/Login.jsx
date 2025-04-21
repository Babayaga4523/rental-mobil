import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Login.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validasi client-side
    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
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

      // Simpan token dan data user
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Login berhasil');
      
      // Redirect berdasarkan role
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="login-card p-4 p-md-5 bg-white shadow-lg rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <img src="/assets/logo.png" alt="Logo" className="login-logo mb-3" style={{ width: '100px' }} />
          <h3 className="text-primary fw-bold">Login</h3>
          <p className="text-muted">Silakan masuk untuk melanjutkan</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3 form-floating">
            <input
              type="email"
              id="inputEmail"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="inputEmail">Email</label>
          </div>

          <div className="mb-4 position-relative form-floating">
            <input
              type={showPassword ? 'text' : 'password'}
              id="inputPassword"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
            />
            <label htmlFor="inputPassword">Password</label>
            <span
              className="position-absolute top-50 end-0 translate-middle-y pe-3 text-secondary"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: 'pointer' }}
            >
              <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 btn-lg rounded-pill"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Memproses...
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted">
            Belum punya akun?{' '}
            <a href="/register" className="text-primary text-decoration-none">
              Daftar di sini
            </a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;