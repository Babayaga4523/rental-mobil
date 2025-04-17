import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Footer from "./components/Footer";
import About from "./pages/about";
import Kontak from "./pages/kontak";
import SearchResults from "./pages/SearchResults";
import Layanan from "./pages/layanan";
import DetailMobil from "./pages/DetailMobil"; // Pastikan import ini benar
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Testimoni from "./pages/Testimoni";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/layanan" element={<Layanan />} />
        <Route path="/kontak" element={<Kontak />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/detail/:id" element={<DetailMobil />} />
        <Route path="/testimoni" element={<Testimoni />} />
        {/* Route 404 kalau halaman nggak ditemukan */}
        <Route path="*" element={<h2 style={{ textAlign: "center", marginTop: "50px" }}>404 - Halaman Tidak Ditemukan</h2>} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
