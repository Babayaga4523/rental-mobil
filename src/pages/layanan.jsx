import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../style/Layanan.css";

const Layanan = () => {
  const [layanan, setLayanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  // Car categories for filtering
  const categories = ["All", "Sedan", "SUV", "MPV", "Sport", "Luxury"];

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false, // Allow animations to trigger every time element comes into view
      mirror: true, // Animate out when scrolling past
      easing: 'ease-in-out-quad'
    });
    
    const fetchLayanan = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/layanan");
        if (!response.ok) throw new Error("Failed to load services");
        const data = await response.json();
        setLayanan(data);
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
    <div className="layanan-page">
      {/* Hero Section with Parallax Effect */}
      <section className="layanan-hero">
        <div className="container h-100">
          <div className="row h-100 align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hero-title"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                Temukan Mobil <span className="highlight">Perfect</span> Untuk Anda
              </motion.h1>
              <p 
                className="hero-subtitle"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                Pilih dari koleksi mobil premium kami yang selalu terawat dan siap menemani perjalanan Anda
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary btn-lg rounded-pill px-4 py-2 mt-3"
                onClick={() => document.getElementById("layanan-section").scrollIntoView({ behavior: 'smooth' })}
                data-aos="fade-up"
                data-aos-delay="500"
                data-aos-anchor-placement="top-bottom"
              >
                <i className="fas fa-car me-2"></i>Lihat Armada
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section 
        className="search-section py-4 bg-white sticky-top shadow-sm"
        data-aos="fade-down"
        data-aos-offset="0"
        data-aos-easing="ease-in-sine"
      >
        <div className="container">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div 
                className="search-box input-group"
                data-aos="fade-right"
                data-aos-delay="200"
              >
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Cari mobil (nama atau deskripsi)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div 
                className="filter-buttons d-flex flex-wrap gap-2 justify-content-md-end"
                data-aos="fade-left"
                data-aos-delay="200"
              >
                {categories.map((category, index) => (
                  <button
                    key={category}
                    className={`btn btn-sm rounded-pill ${activeFilter === category ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setActiveFilter(category)}
                    data-aos="zoom-in"
                    data-aos-delay={300 + (index * 100)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section id="layanan-section" className="layanan-main py-5">
        <div className="container">
          <div 
            className="section-header text-center mb-5" 
            data-aos="fade-up"
            data-aos-offset="200"
          >
            <h2 className="section-title">Armada Kami</h2>
            <p className="section-subtitle">Pilihan mobil terbaik untuk setiap kebutuhan perjalanan Anda</p>
          </div>

          {loading ? (
            <div 
              className="text-center py-5"
              data-aos="zoom-in"
            >
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Memuat data mobil...</p>
            </div>
          ) : error ? (
            <div 
              className="text-center py-5"
              data-aos="zoom-in"
            >
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
              <button 
                className="btn btn-outline-primary mt-3"
                onClick={() => window.location.reload()}
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <i className="fas fa-sync-alt me-2"></i>Coba Lagi
              </button>
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
                    className="car-card w-100 d-flex flex-column"
                  >
                    <div className="car-image">
                      <img
                        src={car.gambar}
                        alt={car.nama}
                        className="img-fluid"
                        data-aos="zoom-in"
                      />
                      <div className="car-badge">
                        <span 
                          className="badge bg-primary"
                          data-aos="fade-right"
                          data-aos-delay="300"
                        >
                          {car.kategori || 'Premium'}
                        </span>
                        <span 
                          className="badge bg-success"
                          data-aos="fade-left"
                          data-aos-delay="300"
                        >
                          Rp {car.harga.toLocaleString('id-ID')}/hari
                        </span>
                      </div>
                      <div className="car-overlay">
                        <button 
                          className="btn btn-light btn-sm rounded-pill"
                          onClick={() => navigate(`/detail/${car.id}`)}
                          data-aos="zoom-in"
                          data-aos-delay="400"
                        >
                          <i className="fas fa-eye me-2"></i>Lihat Detail
                        </button>
                      </div>
                    </div>
                    <div className="car-body d-flex flex-column flex-grow-1">
                      <h3 data-aos="fade-up" data-aos-delay="200">{car.nama}</h3>
                      <div 
                        className="car-features"
                        data-aos="fade-up"
                        data-aos-delay="300"
                      >
                        {car.fitur?.slice(0, 3).map((fitur, i) => (
                          <span key={i}>{fitur}</span>
                        ))}
                      </div>
                      <div className="mt-auto pt-3">
                        <button
                          className="btn btn-primary w-100 rounded-pill py-2"
                          onClick={() => navigate(`/booking`)}
                          data-aos="fade-up"
                          data-aos-delay="400"
                        >
                          <i className="fas fa-calendar-check me-2"></i>Pesan Sekarang
                        </button>
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
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                Tidak ditemukan mobil yang sesuai dengan pencarian Anda
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("All");
                }}
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <i className="fas fa-times me-2"></i>Reset Filter
              </button>
            </div>
          )}

          {/* CTA Section */}
          <div 
            className="cta-section text-center mt-5 pt-5"
            data-aos="fade-up"
            data-aos-offset="200"
          >
            <h3 className="fw-bold mb-4">Butuh Bantuan Memilih Mobil?</h3>
            <p className="mb-4">Tim ahli kami siap membantu Anda menemukan mobil yang sempurna untuk kebutuhan Anda.</p>
            <div className="d-flex justify-content-center gap-3">
              <a 
                href="https://wa.me/6281234567890" 
                className="btn btn-success px-4 py-2 rounded-pill"
                target="_blank"
                rel="noreferrer"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <i className="fab fa-whatsapp me-2"></i>Chat via WhatsApp
              </a>
              <button 
                className="btn btn-outline-primary px-4 py-2 rounded-pill"
                onClick={() => navigate("/contact")}
                data-aos="zoom-in"
                data-aos-delay="300"
              >
                <i className="fas fa-phone me-2"></i>Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Layanan;