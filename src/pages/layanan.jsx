import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Modal, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../style/LayananPage.css";

const BACKEND_URL = "http://localhost:3000";

const getHargaSetelahPromo = (car) => {
  if (car.promo && car.promo > 0) {
    return Math.round(car.harga - (car.harga * car.promo / 100));
  }
  return car.harga;
};

const Layanan = () => {
  const [layanan, setLayanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("terbaru");
  const [filterTransmisi, setFilterTransmisi] = useState("");
  const [filterKapasitas, setFilterKapasitas] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { key: "All", label: "Semua", icon: "fa-th-large" },
    { key: "Sedan", label: "Sedan", icon: "fa-car-side" },
    { key: "SUV", label: "SUV", icon: "fa-car" },
    { key: "MPV", label: "MPV", icon: "fa-shuttle-van" },
    { key: "Van", label: "Van", icon: "fa-bus" },
    { key: "Luxury", label: "Luxury", icon: "fa-gem" },
    { key: "Sport", label: "Sport", icon: "fa-flag-checkered" },
  ];

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

  // Filter & sort
  const filteredLayanan = layanan.filter(car => {
    const nama = car.nama ? car.nama.toLowerCase() : "";
    const deskripsi = car.deskripsi ? car.deskripsi.toLowerCase() : "";
    const matchesSearch =
      nama.includes(searchTerm.toLowerCase()) ||
      deskripsi.includes(searchTerm.toLowerCase());
    const matchesCategory = activeFilter === "All" || car.kategori === activeFilter;
    const matchesTransmisi = !filterTransmisi || (car.transmisi === filterTransmisi);
    const matchesKapasitas = !filterKapasitas || (car.kapasitas?.toString() === filterKapasitas);
    return matchesSearch && matchesCategory && matchesTransmisi && matchesKapasitas;
  });

  const sortedAndFilteredLayanan = filteredLayanan.sort((a, b) => {
    switch (sortBy) {
      case "harga_asc":
        return (a.harga || 0) - (b.harga || 0);
      case "harga_desc":
        return (b.harga || 0) - (a.harga || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const handleQuickView = (car) => {
    setSelectedCar(car);
    setShowModal(true);
  };

  return (
    <div className="layanan-page-root">
      {/* Hero Section */}
      <section className="layanan-page-hero position-relative overflow-hidden">
        <div className="layanan-page-hero-overlay position-absolute w-100 h-100 top-0 start-0"></div>
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
                {categories.map((cat, index) => (
                  <motion.button
                    key={cat.key}
                    className={`layanan-page-filter-btn btn btn-sm rounded-pill px-3 d-flex align-items-center gap-2 ${activeFilter === cat.key ? 'active shadow' : ''}`}
                    onClick={() => setActiveFilter(cat.key)}
                    data-aos="zoom-in"
                    data-aos-delay={300 + (index * 100)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                  >
                    <i className={`fas ${cat.icon} ${activeFilter === cat.key ? 'text-primary' : 'text-muted'}`}></i>
                    <span>{cat.label}</span>
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
            <div className="text-center py-5" data-aos="zoom-in">
              <div className="spinner-grow text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Memuat data mobil...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5" data-aos="zoom-in">
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
          ) : (
            <>
              {/* Sorting and Additional Filtering */}
              <div className="row g-3 align-items-center mb-3">
                <div className="col-md-4">
                  <select
                    className="form-select rounded-pill"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="terbaru">Terbaru</option>
                    <option value="harga_asc">Harga Termurah</option>
                    <option value="harga_desc">Harga Termahal</option>
                    <option value="rating">Rating Tertinggi</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select rounded-pill"
                    value={filterTransmisi}
                    onChange={e => setFilterTransmisi(e.target.value)}
                  >
                    <option value="">Semua Transmisi</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select rounded-pill"
                    value={filterKapasitas}
                    onChange={e => setFilterKapasitas(e.target.value)}
                  >
                    <option value="">Semua Kapasitas</option>
                    <option value="4">4 Orang</option>
                    <option value="6">6 Orang</option>
                    <option value="8">8 Orang</option>
                  </select>
                </div>
              </div>

              {sortedAndFilteredLayanan.length > 0 ? (
                <div className="row g-4">
                  {sortedAndFilteredLayanan.map((car, index) => (
                    <div
                      className="col-xl-3 col-lg-4 col-md-6 d-flex"
                      key={car.id}
                      data-aos="fade-up"
                      data-aos-delay={(index % 4) * 100}
                      data-aos-offset="100"
                    >
                      <motion.div
                        whileHover={{ y: -10, scale: 1.03 }}
                        className="layanan-page-car-card w-100 d-flex flex-column bg-white rounded-4 overflow-hidden shadow-sm border-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="layanan-page-car-image position-relative overflow-hidden">
                          <img
                            src={car.gambar ? (car.gambar.startsWith("http") ? car.gambar : BACKEND_URL + car.gambar) : "/images/default-car.jpg"}
                            alt={car.nama}
                            className="img-fluid w-100"
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                          <div className="car-badge position-absolute top-0 start-0 w-100 d-flex justify-content-between p-3">
                            <span className={`badge rounded-pill ${car.status === "available"
                              ? "bg-success"
                              : car.status === "unavailable"
                                ? "bg-warning"
                                : "bg-secondary"
                              }`}>
                              {car.status === "available"
                                ? "Tersedia"
                                : car.status === "unavailable"
                                  ? "Sedang Disewa"
                                  : car.status || "Status Tidak Diketahui"}
                            </span>
                            {car.promo && car.promo > 0 && (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip>Promo {car.promo}%</Tooltip>}
                              >
                                <span className="badge rounded-pill bg-danger shadow-sm">
                                  <i className="fas fa-bolt me-1"></i> {car.promo}%
                                </span>
                              </OverlayTrigger>
                            )}
                          </div>
                        </div>
                        <div className="layanan-page-car-body d-flex flex-column flex-grow-1 p-4">
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <h3 className="fw-bold mb-0">{car.nama}</h3>
                            <span className="badge bg-light text-dark border border-1 border-secondary ms-2">{car.kategori}</span>
                          </div>
                          <div className="mb-2">
                            {car.promo && car.promo > 0 ? (
                              <>
                                <span style={{ textDecoration: "line-through", color: "#bbb", marginRight: 6 }}>
                                  Rp {car.harga?.toLocaleString('id-ID')}
                                </span>
                                <span className="fw-bold text-warning fs-5">
                                  Rp {getHargaSetelahPromo(car).toLocaleString('id-ID')}
                                </span>
                                <span className="text-muted ms-1">/hari</span>
                              </>
                            ) : (
                              <>
                                <span className="fw-bold fs-5">Rp {car.harga?.toLocaleString('id-ID')}</span>
                                <span className="text-muted ms-1">/hari</span>
                              </>
                            )}
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <i
                                key={i}
                                className={`fas fa-star${i < Math.round(car.rating || 0) ? "" : "-o"} text-warning me-1`}
                                style={{ fontSize: "1rem" }}
                              />
                            ))}
                            <span className="ms-2 text-muted small">
                              {car.rating ? `${car.rating.toFixed(1)} (${car.jumlah_review || 0})` : "Belum ada rating"}
                            </span>
                          </div>
                          <div className="mb-2">
                            <span className="badge bg-info me-2">{car.transmisi}</span>
                            <span className="badge bg-secondary">{car.kapasitas} Orang</span>
                          </div>
                          <div className="car-features mt-2 mb-3">
                            {Array.isArray(car.fitur) && car.fitur.slice(0, 3).map((fitur, i) => (
                              <span key={i} className="badge bg-light text-dark border border-1 border-primary me-2 mb-1">
                                <i className="fas fa-check-circle text-success me-1"></i>{fitur}
                              </span>
                            ))}
                          </div>
                          <div className="d-flex gap-2 mt-auto pt-2">
                            <button
                              className="btn btn-outline-primary w-50 rounded-pill py-2"
                              onClick={() => handleQuickView(car)}
                            >
                              <i className="fas fa-eye me-2"></i>Lihat Detail
                            </button>
                            <button
                              className="btn btn-primary w-50 rounded-pill py-2"
                              onClick={() => navigate(`/detail/${car.id}`)}
                            >
                              <i className="fas fa-calendar-check me-2"></i>Pesan
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5" data-aos="zoom-in">
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
                        setSortBy("terbaru");
                        setFilterTransmisi("");
                        setFilterKapasitas("");
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
            </>
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

      {/* Quick View Modal */}
      {selectedCar && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>{selectedCar.nama}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row">
              <div className="col-md-6">
                <img
                  src={selectedCar.gambar ? (selectedCar.gambar.startsWith("http") ? selectedCar.gambar : BACKEND_URL + selectedCar.gambar) : "/images/default-car.jpg"}
                  alt={selectedCar.nama}
                  className="img-fluid rounded-3 mb-3"
                />
              </div>
              <div className="col-md-6">
                <h5 className="mb-3">Fitur:</h5>
                <ul>
                  {Array.isArray(selectedCar.fitur) && selectedCar.fitur.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <div className="mb-3">
                  <strong>Harga:</strong>{" "}
                  {selectedCar.promo && selectedCar.promo > 0 ? (
                    <>
                      <span style={{ textDecoration: "line-through", color: "#bbb", marginRight: 6 }}>
                        Rp {selectedCar.harga?.toLocaleString('id-ID')}
                      </span>
                      <span className="fw-bold text-warning">
                        Rp {getHargaSetelahPromo(selectedCar).toLocaleString('id-ID')}
                      </span>
                      /hari
                    </>
                  ) : (
                    <>Rp {selectedCar.harga?.toLocaleString('id-ID')}/hari</>
                  )}
                </div>
                <div className="mb-3">
                  <strong>Status:</strong> {selectedCar.status || "Tersedia"}
                </div>
                <div className="mb-3">
                  <strong>Transmisi:</strong> {selectedCar.transmisi}
                </div>
                <div className="mb-3">
                  <strong>Kapasitas:</strong> {selectedCar.kapasitas} Orang
                </div>
                <button
                  className="btn btn-primary rounded-pill"
                  onClick={() => {
                    setShowModal(false);
                    navigate(`/detail/${selectedCar.id}`);
                  }}
                >
                  <i className="fas fa-calendar-check me-2"></i>Pesan Sekarang
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Layanan;