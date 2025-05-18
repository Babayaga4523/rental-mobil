import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import "../style/LayananPage.css";

const BACKEND_URL = "http://localhost:3000";

const Layanan = () => {
  const [layanan, setLayanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  // Car categories for filtering
  const categories = ["All", "Sedan", "SUV", "MPV", "VAN", "Sport", "Luxury"];

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      easing: 'ease-in-out-quad'
    });
    
    const fetchLayanan = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/layanan`);
        if (!response.ok) throw new Error("Failed to load services");
        const data = await response.json();
        setLayanan(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLayanan();
  }, []);

  // Filter cars based on search term and category
  const filteredLayanan = layanan.filter(car => {
    const matchesSearch = car.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         car.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilter === "All" || car.kategori === activeFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="layanan-page-root">
      {/* Hero Section */}
      <section className="layanan-page-hero position-relative overflow-hidden">
        <div className="layanan-page-hero-overlay position-absolute w-100 h-100 top-0 start-0"></div>
        
        {/* Animated Gradient Background */}
        <motion.div 
          className="position-absolute w-100 h-100 top-0 start-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%)'
          }}
        />
        
        <div className="container h-100 position-relative z-index-1">
          <div className="row h-100 align-items-center">
            <div className="col-lg-8 mx-auto text-center px-4">
              {/* Main Title */}
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hero-title text-white mb-4 fw-bold display-4"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                Temukan Mobil <span className="text-gradient">Sempurna</span> Untuk Anda
              </motion.h1>
              
              {/* Subtitle */}
              <motion.p 
                className="hero-subtitle text-light fs-5 mb-5 mx-auto"
                style={{ maxWidth: '600px' }}
                data-aos="fade-up"
                data-aos-delay="300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Pilih dari koleksi mobil premium kami yang selalu terawat dan siap menemani perjalanan Anda
              </motion.p>
              
              {/* CTA Button */}
              <motion.div
                data-aos="fade-up"
                data-aos-delay="500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  className="btn btn-primary btn-lg rounded-pill px-4 py-3 hero-cta d-inline-flex align-items-center"
                  onClick={() => document.getElementById("layanan-section").scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="fas fa-car me-3 fs-5"></i>
                  <span className="fw-medium">Lihat Armada</span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section 
        className="layanan-page-search-section py-4 sticky-top bg-white shadow-sm"
        data-aos="fade-down"
        data-aos-offset="0"
        data-aos-easing="ease-in-sine"
      >
        <div className="container">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div 
                className="layanan-page-search-box input-group border rounded-pill overflow-hidden"
                data-aos="fade-right"
                data-aos-delay="200"
              >
                <span className="input-group-text bg-white border-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  placeholder="Cari mobil (nama atau deskripsi)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="clear-search bg-transparent border-0 px-3"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="fas fa-times text-muted"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div 
                className="layanan-page-filter-buttons d-flex flex-wrap gap-2 justify-content-md-end"
                data-aos="fade-left"
                data-aos-delay="200"
              >
                {categories.map((category, index) => (
                  <motion.button
                    key={category}
                    className={`filter-btn btn btn-sm rounded-pill px-3 ${activeFilter === category ? 'active' : ''}`}
                    onClick={() => setActiveFilter(category)}
                    data-aos="zoom-in"
                    data-aos-delay={300 + (index * 100)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                    {activeFilter === category && (
                      <motion.span 
                        className="filter-indicator"
                        layoutId="filterIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section id="layanan-section" className="layanan-page-main py-5 bg-light">
        <div className="container">
          <div 
            className="layanan-page-section-header text-center mb-5" 
            data-aos="fade-up"
            data-aos-offset="200"
          >
            <h2 className="section-title fw-bold">Armada Kami</h2>
            <p className="section-subtitle text-muted">Pilihan mobil terbaik untuk setiap kebutuhan perjalanan Anda</p>
          </div>

          {loading ? (
            <div 
              className="text-center py-5"
              data-aos="zoom-in"
            >
              <div className="spinner-grow text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Memuat data mobil...</p>
            </div>
          ) : error ? (
            <div 
              className="text-center py-5"
              data-aos="zoom-in"
            >
              <div className="error-card bg-white p-5 rounded-4 shadow-sm">
                <i className="fas fa-exclamation-triangle error-icon text-danger fs-1 mb-3"></i>
                <h4 className="error-title fw-bold">Oops! Terjadi Kesalahan</h4>
                <p className="error-message text-muted">{error}</p>
                <button 
                  className="btn btn-outline-primary mt-3"
                  onClick={() => window.location.reload()}
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <i className="fas fa-sync-alt me-2"></i>Coba Lagi
                </button>
              </div>
            </div>
          ) : filteredLayanan.length > 0 ? (
            <div className="row g-4">
              {filteredLayanan.map((car, index) => (
                <div 
                  className="col-xl-3 col-lg-4 col-md-6 d-flex" 
                  key={car.id}
                  data-aos="fade-up"
                  data-aos-delay={(index % 4) * 100}
                  data-aos-offset="100"
                >
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="layanan-page-car-card w-100 d-flex flex-column bg-white rounded-4 overflow-hidden shadow-sm border-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="layanan-page-car-image position-relative overflow-hidden">
                      <img
                        src={
                          car.gambar
                            ? car.gambar.startsWith("http")
                              ? car.gambar
                              : BACKEND_URL + car.gambar
                            : "/images/default-car.jpg"
                        }
                        alt={car.nama}
                        className="img-fluid w-100"
                        style={{ height: "200px", objectFit: "cover" }}
                        data-aos="zoom-in"
                      />
                      <div className="car-badge position-absolute top-0 start-0 w-100 d-flex justify-content-between p-3">
                        <span 
                          className="badge rounded-pill bg-primary"
                          data-aos="fade-right"
                          data-aos-delay="300"
                        >
                          {car.kategori || 'Premium'}
                        </span>
                        <span 
                          className="badge rounded-pill bg-dark"
                          data-aos="fade-left"
                          data-aos-delay="300"
                        >
                          Rp {car.harga?.toLocaleString('id-ID') || '500.000'}/hari
                        </span>
                      </div>
                    </div>
                    <div className="layanan-page-car-body d-flex flex-column flex-grow-1 p-4">
                      <h3 className="fw-bold" data-aos="fade-up" data-aos-delay="200">{car.nama}</h3>
                      <div 
                        className="car-features mt-3"
                        data-aos="fade-up"
                        data-aos-delay="300"
                      >
                        {car.fitur?.slice(0, 3).map((fitur, i) => (
                          <div key={i} className="d-flex align-items-center mb-2">
                            <i className="fas fa-check-circle text-success me-2"></i>
                            <span className="text-muted">{fitur}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-3">
                        <motion.button
                          className="btn btn-primary w-100 rounded-pill py-2 book-btn"
                          onClick={() => navigate(`/detail/${car.id}`)}
                          data-aos="fade-up"
                          data-aos-delay="400"
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          <i className="fas fa-calendar-check me-2"></i>Pesan Sekarang
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="text-center py-5"
              data-aos="zoom-in"
            >
              <div className="no-results-card bg-white p-5 rounded-4 shadow-sm">
                <i className="fas fa-car-crash no-results-icon text-warning fs-1 mb-3"></i>
                <h4 className="no-results-title fw-bold">Tidak Ditemukan</h4>
                <p className="no-results-message text-muted">
                  Tidak ada mobil yang sesuai dengan pencarian Anda. Coba kata kunci lain atau filter yang berbeda.
                </p>
                <motion.button 
                  className="btn btn-outline-secondary reset-btn mt-3"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveFilter("All");
                  }}
                  data-aos="fade-up"
                  data-aos-delay="200"
                  whileHover={{ scale: 1.05 }}
                >
                  <i className="fas fa-redo me-2"></i>Reset Pencarian
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="layanan-page-cta-section py-5 bg-primary">
        <div className="container">
          <div className="layanan-page-cta-card p-5 rounded-4 bg-white shadow">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h3 className="cta-title fw-bold mb-3">Butuh Bantuan Memilih Mobil?</h3>
                <p className="cta-text text-muted">
                  Tim kami siap membantu Anda menemukan mobil yang sesuai dengan kebutuhan dan budget Anda.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <motion.button
                  className="btn btn-primary rounded-pill px-4 py-3 cta-btn fw-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-headset me-2"></i>Hubungi Kami
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Layanan;