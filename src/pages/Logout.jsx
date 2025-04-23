import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // Hapus token dan data user dari localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Notifikasi sukses dengan opsi tambahan
      toast.success('Anda berhasil logout', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        icon: "👋",
        onClose: () => {
          // Arahkan pengguna ke halaman login setelah notifikasi ditutup
          navigate('/login');
        }
      });

    } catch (error) {
      // Notifikasi error jika terjadi masalah
      toast.error('Gagal melakukan logout', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored"
      });
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <button 
        onClick={handleLogout} 
        className="btn btn-danger"
        style={{
          padding: '8px 16px',
          borderRadius: '4px',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
      >
        <i className="bi bi-box-arrow-right me-2"></i>
        Logout
      </button>
    </>
  );
};

export default Logout;
