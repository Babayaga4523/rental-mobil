import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";  // Import ToastContainer
import "react-toastify/dist/ReactToastify.css";  // Import style Toastify

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from './components/ProtectedRoute'; 

// Pages
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/about"; 
import Kontak from "./pages/kontak";  
import Layanan from "./pages/layanan";  
import SearchResults from "./pages/SearchResults";
import DetailMobil from "./pages/DetailMobil";
import Testimoni from "./pages/Testimoni";
import NotFound from './pages/NotFound';

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/layanan" element={<Layanan />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/detail/:id" element={<DetailMobil />} />
        <Route path="/testimoni" element={<Testimoni />} />
        <Route path="/home" element={<Home />} />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/booking" 
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* 404 Not Found */}
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
      <ToastContainer />  {/* Menambahkan ToastContainer di bagian bawah */}
      <Footer />
   
    </Router>
    
  );
}

export default App;
