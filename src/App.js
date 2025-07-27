// App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./Admin/AdminDashboard";
import OrdersPage from "./Admin/OrdersPage";
import CarsPage from "./Admin/CarsPage";
import UsersPage from "./Admin/UsersPage";
import About from "./pages/about";
import Kontak from "./pages/kontak";
import Layanan from "./pages/layanan";
import SearchResults from "./pages/SearchResults";
import DetailMobil from "./pages/DetailMobil";
import Testimoni from "./pages/Testimoni";
import NotFound from './pages/NotFound';
import Payment from "./pages/Payment";
import OrderReceipt from "./pages/OrderReceipt";
import { AuthProvider } from './context/AuthContext';
import AdminReport from "./Admin/Report";
import UserOrdersPage from "./pages/UserOrdersPage";
import Gallery from "./pages/Gallery";
import Profile from "./pages/Profile";
import TestimoniReplyPage from "./Admin/TestimoniReplyPage";
// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  // Tambahkan state darkMode global
  const [darkMode, setDarkMode] = useState(() => {
    // Cek localStorage agar dark mode tetap setelah reload
    const stored = localStorage.getItem("darkMode");
    return stored ? JSON.parse(stored) : false;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.className = darkMode ? "bg-dark text-light" : "bg-light text-dark";
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <div className="app-root-flex">
      {!isAdminPage && <Navbar />}
      <div className="app-content-flex">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/detail/:id" element={<DetailMobil />} />
          <Route path="/testimoni" element={<Testimoni />} />
          <Route path="/gallery" element={<Gallery />} />
          {/* User Order Routes */}
          <Route path="/pesanan" element={
            <ProtectedRoute>
              <UserOrdersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/pesanan/:orderId" element={
            <ProtectedRoute>
              <UserOrdersPage />
            </ProtectedRoute>
          } />

          {/* Protected Routes */}
          <Route path="/booking" element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          } />
          
          <Route path="/booking/:id" element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          } />
          
          <Route path="/payment" element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          } />
          
          <Route path="/orders/:orderId/receipt" element={
            <ProtectedRoute>
              <OrderReceipt />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard 
                darkMode={darkMode} 
                toggleDarkMode={toggleDarkMode} 
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
              />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="orders" />} />
            <Route path="orders" element={<OrdersPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="cars" element={<CarsPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="users" element={<UsersPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
            <Route path="report" element={
              <AdminReport darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            } />
             <Route path="testimoni" element={< TestimoniReplyPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
          </Route>

          {/* Error Routes */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      {!isAdminPage && <Footer />}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;