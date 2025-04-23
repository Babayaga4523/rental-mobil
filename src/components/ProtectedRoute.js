import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Corrected import
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  
  // Jika tidak ada token, redirect ke login dan beri notifikasi
  if (!token) {
    toast.error('Anda harus login terlebih dahulu');
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    // Cek expired token
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      toast.error('Session telah kedaluwarsa, silakan login kembali');
      return <Navigate to="/login" replace />;
    }

    // Cek role jika diperlukan
    if (requiredRole && userRole !== requiredRole) {
      toast.error('Akses ditolak. Anda tidak memiliki hak akses');
      return <Navigate to="/not-found" replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('token');
    toast.error('Token tidak valid, silakan login kembali');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
