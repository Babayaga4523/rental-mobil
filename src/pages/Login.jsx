import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
    
      const data = await response.json();

      if (response.ok) {
        alert("Login berhasil!");
        // Simpan token / info user jika ada
        localStorage.setItem("nama", data.user.nama);
        localStorage.setItem("role", data.user.role);

        // Redirect berdasarkan role
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/home";
        }

      } else {
        alert(data.message);
      }

    } catch (error) {
      alert("Terjadi kesalahan saat login.");
      console.error(error);
    }
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <div className="login-card p-5 shadow-lg rounded-4">
        <div className="text-center mb-4">
          <img src="/assets/logo-pawon.png" alt="Logo" className="login-logo mb-3" />
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
              type={showPassword ? "text" : "password"}
              id="inputPassword"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="inputPassword">Password</label>
            <span
              className="position-absolute top-50 end-0 translate-middle-y pe-3 text-secondary"
              onClick={() => setShowPassword(!showPassword)}
              style={{ cursor: "pointer" }}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </span>
          </div>

          <button type="submit" className="btn btn-primary w-100 btn-lg rounded-pill">
            Masuk
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted">
            Belum punya akun? <a href="/register" className="text-primary">Daftar di sini</a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
