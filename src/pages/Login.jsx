import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(location.state?.from || '/home');
    }
  }, [navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Please fill in both email and password', { position: 'top-center' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token_expiry', Date.now() + 24 * 60 * 60 * 1000);
      toast.success('Login successful!');
      const redirectPath = location.state?.from ||
        (data.user.role === 'admin' ? '/admin' : '/home');
      navigate(redirectPath, {
        state: { user: data.user, from: location.pathname }
      });
    } catch (error) {
      if (error.message.includes('401')) toast.error('Invalid email or password');
      else if (error.message.includes('403')) toast.error('Account not activated');
      else if (error.message.includes('Network Error')) toast.error('Cannot connect to server');
      else toast.error(error.message || 'Login error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container"style={{ paddingTop: 100 }}>
      <ToastContainer position="top-center" autoClose={5000} />
      <div className="login-wrapper">
        <div className="login-card">
          {/* Logo & Judul */}
          <div className="logo-wrapper text-center mb-4">
            <div
              className="logo-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{ overflow: "hidden" }}
            >
              <img
                src="/images/logo.png"
                alt="Logo"
                className="logo-img"
                style={{ width: "64%", height: "64%", objectFit: "contain" }}
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <i className="bi bi-shield-lock fs-3" style={{ display: "none" }}></i>
            </div>
            <h2 className="app-title text-gradient">RENTAL HS</h2>
          </div>
          
          {/* Header */}
          <div className="login-header text-center mb-4">
            <h3 className="fw-bold mb-2">Welcome Back</h3>
            <p className="text-muted">Sign in to access your account</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 mb-3 login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing In...
                </>
              ) : "Sign In"}
            </button>      
            <div className="text-center">
              <span className="text-muted">Don't have an account? </span>
              <a href="/register" className="text-decoration-none fw-bold">Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;