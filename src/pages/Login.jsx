import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Email harus diisi', { position: 'top-center' });
      return;
    }

    if (!password) {
      toast.error('Password harus diisi', { position: 'top-center' });
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

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Email atau password salah');
        } else if (response.status === 403) {
          toast.error('Akun Anda belum aktif');
        } else {
          throw new Error(data.message || 'Login gagal');
        }
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success('Login berhasil!');
      
      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
          toast.info('Selamat datang di Dashboard Admin', { position: 'top-right' });
        } else {
          navigate('/home');
          toast.info(`Selamat datang, ${data.user.name}!`, { position: 'top-right' });
        }
      }, 2000);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <ToastContainer />
      <LoginCard>
        <LogoContainer>
          <Logo src="/assets/logo.png" alt="Logo" />
        </LogoContainer>
        
        <Header>
          <h2>Selamat Datang Kembali</h2>
          <p>Masuk untuk melanjutkan ke akun Anda</p>
        </Header>

        <Form onSubmit={handleLogin}>
          <FormGroup>
            <Label>Alamat Email</Label>
            <Input 
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Password</Label>
            <PasswordWrapper>
              <Input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
              <ToggleButton onClick={() => setShowPassword(!showPassword)}>
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </ToggleButton>
            </PasswordWrapper>
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner />
                Memproses...
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </SubmitButton>
        </Form>

        <Footer>
          <span>Belum punya akun?</span>
          <RegisterLink href="/register">Daftar di sini</RegisterLink>
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
};

// Styled Components
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  }

  @media (max-width: 576px) {
    padding: 2rem;
  }
`;

const LogoContainer = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Logo = styled.img`
  height: 80px;
  width: auto;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    color: #2d3748;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  p {
    color: #718096;
    margin-bottom: 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
`;

const Input = styled.input`
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  width: 100%;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    outline: none;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #667eea;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;

  &:hover {
    background: linear-gradient(to right, #5a6fd1, #6a4299);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #a0aec0;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Spinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid white;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Footer = styled.div`
  text-align: center;
  margin-top: 2rem;
  color: #718096;
  font-size: 0.875rem;
`;

const RegisterLink = styled.a`
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  margin-left: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: #5a6fd1;
    text-decoration: underline;
  }
`;

export default Login;