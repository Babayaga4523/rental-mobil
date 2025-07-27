import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Modal } from "react-bootstrap";
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

const featureIcons = {
  'AC': <i className="fas fa-snowflake me-1"></i>,
  'Audio': <i className="fas fa-music me-1"></i>,
  'WiFi': <i className="fas fa-wifi me-1"></i>,
  'Airbag': <i className="fas fa-shield-alt me-1"></i>,
  'Power Steering': <i className="fas fa-bolt me-1"></i>,
  'Central Lock': <i className="fas fa-key me-1"></i>,
  'Leather Seats': <i className="fas fa-couch me-1"></i>
};

const Layanan = () => {
  // State declarations
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
  const [selectedCar] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
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

  useEffect(() => {
    if (layanan.length > 0) {
      // Ambil 3 mobil dengan jumlah_review terbanyak
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

  const toggleCompare = (car) => {
    setCompareList(list => {
      if (list.find(c => c.id === car.id)) {
        return list.filter(c => c.id !== car.id);
      }
      return list.length < 3 ? [...list, car] : list;
    });
  };

  return (
    <div className="layanan-page">
      {/* Futuristic Hero Section */}
      <section className="hero-section position-relative overflow-hidden">
        <div className="hero-overlay"></div>
        <div className="particles-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              animationDelay: `${Math.random() * 5}s`
            }}></div>
          ))}
        </div>
        
        <div className="container h-100 position-relative z-index-1">
          <div className="row h-100 align-items-center">
            <div className="col-lg-8 mx-auto text-center px-4">
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hero-title mb-4"
                data-aos="zoom-in"
                data-aos-delay="100"
              >
                Temukan <span className="text-gradient">Armada Premium</span> Untuk Perjalanan Anda
              </motion.h1>
              <motion.p
                className="hero-subtitle mb-5 mx-auto"
                style={{ maxWidth: '600px' }}
                data-aos="fade-up"
                data-aos-delay="300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Koleksi mobil terbaik dengan pelayanan profesional untuk setiap kebutuhan perjalanan Anda
              </motion.p>
              <motion.div
                data-aos="fade-up"
                data-aos-delay="500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  className="btn btn-primary btn-lg rounded-pill px-4 py-3 hero-cta"
                  onClick={() => document.getElementById("layanan-section").scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="fas fa-car me-3"></i>
                  <span>Jelajahi Armada</span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Search and Filter Bar */}
      <section className="search-filter-bar sticky-top" data-aos="fade-down">
        <div className="container">
          <div className="search-filter-container">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Cari mobil (nama atau deskripsi)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm("")}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            <div className="filter-buttons">
              {categories.map((cat, index) => (
                <motion.button
                  key={cat.key}
                  className={`filter-btn ${activeFilter === cat.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat.key)}
                  data-aos="zoom-in"
                  data-aos-delay={300 + (index * 100)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <i className={`fas ${cat.icon}`}></i>
                  <span>{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section id="layanan-section" className="main-content py-5">
        <div className="container">
          <div className="section-header text-center mb-5" data-aos="fade-up">
            <h2 className="section-title">Armada Kami</h2>
            <p className="section-subtitle">Pilihan mobil terbaik untuk setiap kebutuhan perjalanan Anda</p>
            
            <div className="info-alert" data-aos="fade-up" data-aos-delay="100">
              <i className="fas fa-user-tie"></i>
              <div>
                <strong>Semua layanan rental sudah termasuk supir profesional.</strong>
                <span className="highlight">Tidak melayani lepas kunci (self-drive).</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="info-card" data-aos="fade-up" data-aos-delay="100">
            <i className="fas fa-info-circle"></i>
            <div>
              <strong>Layanan ini khusus untuk rental dalam kota (Jabodetabek).</strong>
              Untuk <strong>luar kota, drop-off bandara, atau perjalanan khusus</strong>, silakan{' '}
              <a href="https://wa.me/6281381339149" target="_blank" rel="noopener noreferrer">
                chat admin
              </a>{' '}
              untuk konsultasi & penawaran terbaik!
            </div>
          </div>

          {/* Sorting and Filtering Controls */}
          <div className="filter-controls" data-aos="fade-up">
            <div className="filter-group">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="terbaru">Terbaru</option>
                <option value="harga_asc">Harga Termurah</option>
                <option value="harga_desc">Harga Termahal</option>
                <option value="rating">Rating Tertinggi</option>
              </select>
              
              <select value={filterTransmisi} onChange={e => setFilterTransmisi(e.target.value)}>
                <option value="">Semua Transmisi</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
              
              <select value={filterKapasitas} onChange={e => setFilterKapasitas(e.target.value)}>
                <option value="">Semua Kapasitas</option>
                <option value="4">4 Orang</option>
                <option value="6">6 Orang</option>
                <option value="8">8 Orang</option>
              </select>
              
              <select value={filterPromo} onChange={e => setFilterPromo(e.target.value)}>
                <option value="">Semua Promo</option>
                <option value="promo">Ada Promo</option>
                <option value="no_promo">Tanpa Promo</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state" data-aos="zoom-in">
              <div className="spinner"></div>
              <p>Memuat data mobil...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state" data-aos="zoom-in">
              <i className="fas fa-exclamation-triangle"></i>
              <h4>Oops! Terjadi Kesalahan</h4>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>
                <i className="fas fa-sync-alt"></i> Coba Lagi
              </button>
            </div>
          )}

          {/* Car Grid */}
          {!loading && !error && (
            <>
              {sortedAndFilteredLayanan.length > 0 ? (
                <div className="car-grid">
                  {sortedAndFilteredLayanan.map((car, index) => (
                    <motion.div
                      className="car-card d-flex flex-column h-100"
                      key={car.id}
                      data-aos="fade-up"
                      data-aos-delay={(index % 4) * 100}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                    >
                      {/* Favorite and Compare Badges */}
                      {favoritIds.includes(car.id) && (
                        <div className="favorite-badge">
                          <i className="fas fa-star"></i> Favorit
                        </div>
                      )}
                      <div className="compare-checkbox">
                        <input
                          type="checkbox"
                          checked={!!compareList.find(c => c.id === car.id)}
                          onChange={() => toggleCompare(car)}
                          title="Bandingkan mobil ini"
                        />
                      </div>

                      {/* Car Image */}
                      <div className="car-image-container">
                        <img
                          src={car.gambar ? (car.gambar.startsWith("http") ? car.gambar : BACKEND_URL + car.gambar) : "/images/default-car.jpg"}
                          alt={car.nama}
                          className="car-image"
                        />
                        {/* Status and Promo Badges */}
                        <div className="status-badge">
                          {car.status === "available" ? "Tersedia" : "Sedang Disewa"}
                        </div>
                        {car.promo && car.promo > 0 && (
                          <div className="promo-badge">
                            <i className="fas fa-bolt"></i> {car.promo}% OFF
                          </div>
                        )}
                      </div>

                      {/* Car Info */}
                      <div className="car-info d-flex flex-column flex-grow-1">
                        <div className="car-header">
                          <h3>{car.nama}</h3>
                          <span className="category-badge">{car.kategori}</span>
                        </div>
                        <div className="car-features">
                          {getFiturList(car.fitur).map((f, i) => (
                            <span key={i} className="feature-item">
                              {featureIcons[f] || <i className="fas fa-check"></i>}
                              {f}
                            </span>
                          ))}
                        </div>
                        <div className="car-specs">
                          <span><i className="fas fa-cogs"></i> {car.transmisi}</span>
                          <span><i className="fas fa-users"></i> {car.kapasitas} Orang</span>
                          <span><i className="fas fa-star"></i> {car.rating || 'Baru'}</span>
                        </div>
                        <div className="car-price">
                          {car.promo && car.promo > 0 ? (
                            <>
                              <span className="original-price">
                                Rp {car.harga?.toLocaleString('id-ID')}
                              </span>
                              <span className="discounted-price">
                                Rp {getHargaSetelahPromo(car).toLocaleString('id-ID')}
                              </span>
                            </>
                          ) : (
                            <span className="current-price">
                              Rp {car.harga?.toLocaleString('id-ID')}
                            </span>
                          )}
                          <span className="price-label">/hari</span>
                        </div>
                        <div className="mt-auto">
                          <button
                            className="book-button"
                            onClick={() => navigate(`/detail/${car.id}`)}
                          >
                            <i className="fas fa-calendar-check"></i> Pesan Sekarang
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" data-aos="zoom-in">
                  <i className="fas fa-car-crash"></i>
                  <h4>Tidak Ditemukan</h4>
                  <p>Tidak ada mobil yang sesuai dengan pencarian Anda</p>
                  <motion.button
                    className="reset-button"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveFilter("All");
                      setSortBy("terbaru");
                      setFilterTransmisi("");
                      setFilterKapasitas("");
                      setFilterPromo("");
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <i className="fas fa-redo"></i> Reset Pencarian
                  </motion.button>
                </div>
              )}
            </>
          )}

          {/* Compare Section */}
          {compareList.length >= 2 && (
            <div className="compare-bar">
              <div className="compare-items">
                {compareList.map(c => (
                  <span key={c.id} className="compare-item">
                    {c.nama}
                    <button onClick={() => toggleCompare(c)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
              <div className="compare-actions">
                <button className="compare-button" onClick={() => setShowCompareModal(true)}>
                  Bandingkan ({compareList.length})
                </button>
                <button className="reset-button" onClick={() => setCompareList([])}>
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick View Modal */}
      {selectedCar && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="car-modal">
          <Modal.Header closeButton>
            <Modal.Title>{selectedCar.nama}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="modal-content">
              <div className="modal-image">
                <img
                  src={selectedCar.gambar ? (selectedCar.gambar.startsWith("http") ? selectedCar.gambar : BACKEND_URL + selectedCar.gambar) : "/images/default-car.jpg"}
                  alt={selectedCar.nama}
                />
              </div>
              <div className="modal-details">
                <div className="detail-section">
                  <h5>Fitur Utama</h5>
                  <div className="features-grid">
                    {getFiturList(selectedCar.fitur).map((f, i) => (
                      <div key={i} className="feature-item">
                        {featureIcons[f] || <i className="fas fa-check"></i>}
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="detail-section">
                  <h5>Spesifikasi</h5>
                  <div className="specs-grid">
                    <div className="spec-item">
                      <i className="fas fa-tag"></i>
                      <div>
                        <span>Kategori</span>
                        <strong>{selectedCar.kategori}</strong>
                      </div>
                    </div>
                    <div className="spec-item">
                      <i className="fas fa-cogs"></i>
                      <div>
                        <span>Transmisi</span>
                        <strong>{selectedCar.transmisi}</strong>
                      </div>
                    </div>
                    <div className="spec-item">
                      <i className="fas fa-users"></i>
                      <div>
                        <span>Kapasitas</span>
                        <strong>{selectedCar.kapasitas} Orang</strong>
                      </div>
                    </div>
                    <div className="spec-item">
                      <i className="fas fa-star"></i>
                      <div>
                        <span>Rating</span>
                        <strong>{selectedCar.rating || 'Baru'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="price-section">
                  <h5>Harga Sewa</h5>
                  {selectedCar.promo && selectedCar.promo > 0 ? (
                    <div className="discounted-price-container">
                      <div className="original-price">
                        Rp {selectedCar.harga?.toLocaleString('id-ID')}
                      </div>
                      <div className="discounted-price">
                        Rp {getHargaSetelahPromo(selectedCar).toLocaleString('id-ID')}
                        <span className="discount-badge">-{selectedCar.promo}%</span>
                      </div>
                      <div className="price-note">Harga per hari</div>
                    </div>
                  ) : (
                    <div className="normal-price">
                      Rp {selectedCar.harga?.toLocaleString('id-ID')}
                      <span className="price-note">Harga per hari</span>
                    </div>
                  )}
                </div>
                
                <button
                  className="book-button"
                  onClick={() => {
                    setShowModal(false);
                    navigate(`/detail/${selectedCar.id}`);
                  }}
                >
                  <i className="fas fa-calendar-check"></i> Pesan Sekarang
                </button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* Compare Modal */}
      <Modal show={showCompareModal} onHide={() => setShowCompareModal(false)} size="lg" centered className="compare-modal">
        <Modal.Header closeButton>
          <Modal.Title>Perbandingan Mobil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Fitur</th>
                  {compareList.map(car => (
                    <th key={car.id}>
                      <div className="compare-car-header">
                        <img
                          src={car.gambar ? (car.gambar.startsWith("http") ? car.gambar : BACKEND_URL + car.gambar) : "/images/default-car.jpg"}
                          alt={car.nama}
                        />
                        <span>{car.nama}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Harga</td>
                  {compareList.map(car => (
                    <td key={car.id}>
                      {car.promo && car.promo > 0 ? (
                        <>
                          <span className="original-price">Rp {car.harga?.toLocaleString('id-ID')}</span>
                          <span className="discounted-price">Rp {getHargaSetelahPromo(car).toLocaleString('id-ID')}</span>
                        </>
                      ) : (
                        <span className="current-price">Rp {car.harga?.toLocaleString('id-ID')}</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Promo</td>
                  {compareList.map(car => (
                    <td key={car.id}>
                      {car.promo ? (
                        <span className="promo-badge">{car.promo}% OFF</span>
                      ) : (
                        <span className="no-promo">-</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Kategori</td>
                  {compareList.map(car => (
                    <td key={car.id}>{car.kategori}</td>
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
                    <td key={car.id}>
                      {car.rating ? (
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`fas fa-star ${i < Math.floor(car.rating) ? 'filled' : ''}`}
                            ></i>
                          ))}
                          <span>({car.rating.toFixed(1)})</span>
                        </div>
                      ) : (
                        <span>Baru</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Fitur</td>
                  {compareList.map(car => (
                    <td key={car.id}>
                      <ul>
                        {getFiturList(car.fitur).map((f, i) => (
                          <li key={i}>
                            {featureIcons[f] || <i className="fas fa-check"></i>}
                            {f}
                          </li>
                        ))}
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