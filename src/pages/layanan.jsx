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

const getFiturList = (fiturArray) => {
  if (!Array.isArray(fiturArray)) return [];
  return fiturArray.length > 3 ? [...fiturArray.slice(0, 3), 'Dan lainnya...'] : fiturArray;
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
  const [filterPromo, setFilterPromo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [compareList, setCompareList] = useState([]); // Tambahkan state baru
  const [showCompareModal, setShowCompareModal] = useState(false); // State untuk kontrol modal banding
  const [favoritIds, setFavoritIds] = useState([]);
  const navigate = useNavigate();

  const categories = [
    { key: "All", label: "Semua", icon: "fa-th-large" },
    { key: "SUV", label: "SUV", icon: "fa-car" },
    { key: "MPV", label: "MPV", icon: "fa-shuttle-van" },
    { key: "Van", label: "Van", icon: "fa-bus" },
    { key: "Bus", label: "Bus", icon: "fa-bus" },
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

  // Setelah fetchLayanan, hitung favorit
  useEffect(() => {
    if (layanan.length > 0) {
      // Ambil 3 mobil dengan jumlah_review terbanyak (atau tambahkan field order_count jika ada)
      const sorted = [...layanan].sort((a, b) => (b.jumlah_review || 0) - (a.jumlah_review || 0));
      setFavoritIds(sorted.slice(0, 3).map(c => c.id));
    }
  }, [layanan]);

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
    const matchesPromo =
      !filterPromo ||
      (filterPromo === "promo" && car.promo && car.promo > 0) ||
      (filterPromo === "no_promo" && (!car.promo || car.promo === 0));
    return matchesSearch && matchesCategory && matchesTransmisi && matchesKapasitas && matchesPromo;
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

  // Fungsi toggle compare
  const toggleCompare = (car) => {
    setCompareList(list => {
      if (list.find(c => c.id === car.id)) {
        return list.filter(c => c.id !== car.id);
      }
      return list.length < 3 ? [...list, car] : list; // Maks 3 mobil
    });
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
            <div className="alert alert-info d-flex align-items-center mb-4" role="alert" style={{ fontSize: "1.05rem" }}>
              <i className="fas fa-user-tie me-2 fs-5 text-primary"></i>
              <span>
                <b>Semua layanan rental sudah termasuk supir profesional.</b> <br className="d-none d-md-block" />
                <span className="text-danger fw-semibold">Tidak melayani lepas kunci (self-drive).</span>
              </span>
            </div>
          </div>

          {/* Keterangan Dalam Kota & Luar Kota */}
          <div
            className="alert alert-info rounded-4 shadow-sm mb-4"
            data-aos="fade-up"
            data-aos-delay="100"
            style={{ fontSize: "1.08rem", fontWeight: 500 }}
          >
            <i className="fas fa-info-circle me-2"></i>
            <span>
              <b>Layanan ini khusus untuk rental dalam kota (Jabodetabek).</b>
              <br className="d-none d-md-block" />
              Untuk <b>luar kota, drop-off bandara, atau perjalanan khusus</b>, silakan&nbsp;
              <a
                href="https://wa.me/6281381339149"
                target="_blank"
                rel="noopener noreferrer"
                className="fw-bold text-primary"
              >
                chat admin
              </a>
              &nbsp;untuk konsultasi & penawaran terbaik!
            </span>
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
                <div className="col-md-4">
                  <select
                    className="form-select rounded-pill"
                    value={filterPromo}
                    onChange={e => setFilterPromo(e.target.value)}
                  >
                    <option value="">Semua Promo</option>
                    <option value="promo">Ada Promo</option>
                    <option value="no_promo">Tanpa Promo</option>
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
                            {getFiturList(car.fitur).slice(0, 3).map((fitur, i) => (
                              <span key={i} className="badge bg-light text-dark border border-1 border-primary me-2 mb-1">
                                <i className="fas fa-check-circle text-success me-1"></i>{fitur}
                              </span>
                            ))}
                          </div>
                          <div className="d-flex gap-2 mt-auto pt-2">
                            <button
                              className="btn btn-outline-primary w-50 rounded-pill py-2"
                              onClick={() => navigate(`/detail/${car.id}`)}
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
                        <div className="form-check position-absolute top-0 end-0 m-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={!!compareList.find(c => c.id === car.id)}
                            onChange={() => toggleCompare(car)}
                            title="Bandingkan mobil ini"
                          />
                        </div>
                        {favoritIds.includes(car.id) && (
                          <span className="badge rounded-pill bg-primary shadow-sm ms-2">
                            <i className="fas fa-star me-1"></i> Favorit
                          </span>
                        )}
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
                        setFilterPromo("");
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
                  {getFiturList(selectedCar.fitur).map((f, i) => <li key={i}>{f}</li>)}
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

      {/* Compare Section - New Feature */}
      {compareList.length >= 2 && (
        <div className="alert alert-primary d-flex align-items-center gap-3 my-3">
          <span>Bandingkan:</span>
          {compareList.map(c => (
            <span key={c.id} className="badge bg-secondary">{c.nama}</span>
          ))}
          <button
            className="btn btn-sm btn-success ms-auto"
            onClick={() => setShowCompareModal(true)}
          >
            Bandingkan Mobil
          </button>
          <button
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={() => setCompareList([])}
          >
            Reset
          </button>
        </div>
      )}

      {/* Compare Modal */}
      <Modal show={showCompareModal} onHide={() => setShowCompareModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Perbandingan Mobil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-bordered align-middle text-center">
              <thead>
                <tr>
                  <th>Fitur</th>
                  {compareList.map(car => (
                    <th key={car.id}>{car.nama}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Harga</td>
                  {compareList.map(car => (
                    <td key={car.id}>Rp {getHargaSetelahPromo(car).toLocaleString("id-ID")}/hari</td>
                  ))}
                </tr>
                <tr>
                  <td>Promo</td>
                  {compareList.map(car => (
                    <td key={car.id}>{car.promo ? `${car.promo}%` : "-"}</td>
                  ))}
                </tr>
                <tr>
                  <td>Transmisi</td>
                  {compareList.map(car => (
                    <td key={car.id}>{car.transmisi}</td>
                  ))}
                </tr>
                <tr>
                  <td>Kapasitas</td>
                  {compareList.map(car => (
                    <td key={car.id}>{car.kapasitas} Orang</td>
                  ))}
                </tr>
                <tr>
                  <td>Rating</td>
                  {compareList.map(car => (
                    <td key={car.id}>{car.rating ? car.rating.toFixed(1) : "-"}</td>
                  ))}
                </tr>
                <tr>
                  <td>Fitur</td>
                  {compareList.map(car => (
                    <td key={car.id}>
                      <ul className="list-unstyled mb-0">
                        {getFiturList(car.fitur).map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Layanan;