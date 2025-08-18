import React, { useEffect, useState } from "react";
import { Accordion, Carousel } from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/HomePage.css";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { API_URL } from "../utils/api"; // Tambahkan import ini

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [popularCars, setPopularCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counters, setCounters] = useState({ cars: 0, customers: 0, years: 0 });

  const phoneNumber = "628170455544";
  const message = "Halo! Saya tertarik dengan layanan sewa mobil Anda. Bisa minta info lebih lanjut? 🚘";

  // Animated counters
  useEffect(() => {
    let cars = 0, customers = 0, years = 0;
    const carsTarget = 50, customersTarget = 1200, yearsTarget = 10;
    const interval = setInterval(() => {
      if (cars < carsTarget) cars += 2;
      if (customers < customersTarget) customers += 20;
      if (years < yearsTarget) years += 1;
      setCounters({
        cars: cars > carsTarget ? carsTarget : cars,
        customers: customers > customersTarget ? customersTarget : customers,
        years: years > yearsTarget ? yearsTarget : years,
      });
      if (cars >= carsTarget && customers >= customersTarget && years >= yearsTarget) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-out-cubic' });

    setIsLoading(true);
    Promise.all([
      fetch(`${API_URL}/testimoni`).then(res => res.json()).catch(() => []),
      fetch(`${API_URL}/layanan?limit=3`).then(res => res.json()).catch(() => ({ data: [] }))
    ]).then(([testiData, carsData]) => {
      setTestimonials(Array.isArray(testiData.data) ? testiData.data : Array.isArray(testiData) ? testiData : []);
      setPopularCars(Array.isArray(carsData.data) ? carsData.data : Array.isArray(carsData) ? carsData : []);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="home-page-root">
      {/* Floating WhatsApp Button dengan animasi Framer Motion */}
      <motion.a
        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
        className="home-page-wa-float shadow-lg"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat via WhatsApp"
        data-aos="fade-left"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        whileHover={{ scale: 1.08, boxShadow: "0 8px 32px rgba(37,211,102,0.18)" }}
      >
        <i className="bi bi-whatsapp me-2" style={{ fontSize: 24 }}></i>
        <span className="ms-2 d-none d-sm-inline">Hubungi Kami</span>
      </motion.a>

      {/* HERO SECTION */}
      {/* Hero Section dengan animasi Framer Motion */}
      <section className="landing-hero position-relative d-flex align-items-center py-5" style={{ minHeight: "100vh" }}>
        <div className="home-page-hero-overlay"></div>
        <div className="container position-relative z-index-2">
          <div className="row align-items-center">
            <motion.div
              className="col-lg-6 text-center text-lg-start"
              data-aos="fade-right"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="display-3 fw-bold mb-4 home-page-hero-title">
                Sewa Mobil <span className="text-gradient">Premium</span> & Nyaman
              </h1>
              <motion.p
                className="lead mb-4 text-light home-page-hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                Solusi rental mobil terbaik untuk bisnis, liburan, dan perjalanan keluarga. Armada terawat, harga transparan, layanan 24 jam.
              </motion.p>
              <motion.div
                className="d-flex flex-wrap gap-3 mb-4 justify-content-center justify-content-lg-start home-page-hero-cta"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Link to="/layanan" className="btn btn-accent btn-lg px-4">
                  <i className="bi bi-car-front me-2"></i>Pilih Mobil
                </Link>
                <a
                  href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
                  className="btn btn-outline-primary-custom btn-lg px-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-whatsapp me-2"></i>Chat Sekarang
                </a>
              </motion.div>
              <motion.ul
                className="list-unstyled mt-3 text-light hero-features"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <li className="mb-2"><i className="bi bi-check-circle-fill text-gold me-2"></i>Driver profesional & ramah</li>
                <li className="mb-2"><i className="bi bi-check-circle-fill text-gold me-2"></i>Armada terbaru & bersih</li>
                <li><i className="bi bi-check-circle-fill text-gold me-2"></i>Booking mudah & cepat</li>
              </motion.ul>
            </motion.div>
            <motion.div
              className="col-lg-6 text-center mt-5 mt-lg-0 position-relative"
              data-aos="zoom-in"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              <picture>
                <source srcSet="/images/Home.png" type="image/webp" />
                <img
                  src="/images/Home.png"
                  alt="Rental Mobil"
                  className="img-fluid rounded-4 shadow-lg landing-hero-img"
                  style={{ maxWidth: "90%", transition: "transform 0.4s" }}
                  width={600}
                  height={300}
                  loading="eager"
                  fetchpriority="high"
                />
              </picture>
            </motion.div>
          </div>
          <motion.div
            className="scroll-down"
            onClick={() => document.getElementById('cars').scrollIntoView({ behavior: 'smooth' })}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
          >
            <div className="scroll-line bg-white"></div>
            <span className="text-white">Scroll Down</span>
          </motion.div>
        </div>
      </section>

      {/* COUNTERS */}
      <section className="home-page-counters-section py-5 bg-white position-relative">
        <div className="container position-relative z-index-1">
          <div className="row g-4 justify-content-center">
            <div className="col-md-4" data-aos="fade-up">
              <div className="home-page-counter-card glass-card p-4 rounded-4 shadow-sm border-0 text-center bg-white">
                <div className="home-page-counter-number display-4 fw-bold mb-2">{counters.cars}+</div>
                <h5 className="home-page-counter-label fw-semibold">Armada Mobil</h5>
                <p className="text-muted mb-0">Berbagai jenis & kelas</p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
              <div className="home-page-counter-card glass-card p-4 rounded-4 shadow-sm border-0 text-center bg-white">
                <div className="home-page-counter-number display-4 fw-bold mb-2">{counters.customers}+</div>
                <h5 className="home-page-counter-label fw-semibold">Pelanggan</h5>
                <p className="text-muted mb-0">Telah mempercayai kami</p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
              <div className="home-page-counter-card glass-card p-4 rounded-4 shadow-sm border-0 text-center bg-white">
                <div className="home-page-counter-number display-4 fw-bold mb-2">{counters.years}+</div>
                <h5 className="home-page-counter-label fw-semibold">Tahun</h5>
                <p className="text-muted mb-0">Pengalaman melayani</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FITUR UTAMA */}
<section className="features-section py-5" style={{ backgroundColor: '#f8fafc' }}>
  <div className="container">
    <div className="section-header text-center mb-5" data-aos="fade-up">
      <h2 className="fw-bold mb-3" style={{ color: '#1e293b', fontSize: '2.5rem' }}>Kenapa Memilih Kami?</h2>
      <p className="subtitle" style={{ color: '#64748b', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto' }}>
        Keunggulan yang membuat kami berbeda dari yang lain
      </p>
      <div className="alert alert-info d-flex align-items-center mb-4" role="alert" style={{ fontSize: "1.05rem" }}>
    <i className="bi bi-person-badge-fill me-2 fs-5 text-primary"></i>
    <span>
      <b>Semua layanan rental sudah termasuk supir profesional.</b> <br className="d-none d-md-block" />
      <span className="text-danger fw-semibold">Tidak melayani lepas kunci (self-drive).</span>
    </span>
  </div>
    </div>
    
    <div className="row g-4">
      {/* Feature 1 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up">
        <div className="feature-card glass-card p-4 rounded-3 h-100 text-center transition-all">
          <div className="icon-wrapper mb-4 p-3 rounded-circle d-inline-flex align-items-center justify-content-center" 
               style={{ backgroundColor: '#eff6ff', width: '70px', height: '70px' }}>
            <i className="bi bi-car-front-fill" style={{ fontSize: '1.75rem', color: '#3b82f6' }}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{ color: '#1e293b', fontSize: '1.25rem' }}>Armada Berkualitas</h3>
          <p className="feature-description" style={{ color: '#64748b', lineHeight: '1.6' }}>
            Mobil-mobil terbaru dengan perawatan berkala untuk kenyamanan dan keamanan maksimal.
          </p>
        </div>
      </div>
      
      {/* Feature 2 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
        <div className="feature-card glass-card p-4 rounded-3 h-100 text-center transition-all">
          <div className="icon-wrapper mb-4 p-3 rounded-circle d-inline-flex align-items-center justify-content-center" 
               style={{ backgroundColor: '#ecfdf5', width: '70px', height: '70px' }}>
            <i className="bi bi-shield-check" style={{ fontSize: '1.75rem', color: '#10b981' }}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{ color: '#1e293b', fontSize: '1.25rem' }}>Asuransi Lengkap</h3>
          <p className="feature-description" style={{ color: '#64748b', lineHeight: '1.6' }}>
            Perlindungan komprehensif dengan berbagai pilihan paket untuk keamanan perjalanan Anda.
          </p>
        </div>
      </div>
      
      {/* Feature 3 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
        <div className="feature-card glass-card p-4 rounded-3 h-100 text-center transition-all">
          <div className="icon-wrapper mb-4 p-3 rounded-circle d-inline-flex align-items-center justify-content-center" 
               style={{ backgroundColor: '#fef2f2', width: '70px', height: '70px' }}>
            <i className="bi bi-credit-card" style={{ fontSize: '1.75rem', color: '#ef4444' }}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{ color: '#1e293b', fontSize: '1.25rem' }}>Pembayaran Fleksibel</h3>
          <p className="feature-description" style={{ color: '#64748b', lineHeight: '1.6' }}>
            Berbagai metode pembayaran yang aman, termasuk cicilan tanpa kartu kredit.
          </p>
        </div>
      </div>
      
      {/* Feature 4 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
        <div className="feature-card glass-card p-4 rounded-3 h-100 text-center transition-all">
          <div className="icon-wrapper mb-4 p-3 rounded-circle d-inline-flex align-items-center justify-content-center" 
               style={{ backgroundColor: '#f3e8ff', width: '70px', height: '70px' }}>
            <i className="bi bi-headset" style={{ fontSize: '1.75rem', color: '#8b5cf6' }}></i>
          </div>
          <h3 className="fw-bold mb-3" style={{ color: '#1e293b', fontSize: '1.25rem' }}>Dukungan 24/7</h3>
          <p className="feature-description" style={{ color: '#64748b', lineHeight: '1.6' }}>
            Tim profesional siap membantu 24 jam selama masa sewa melalui berbagai channel.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* GALERI MOBIL */}
      <section className="home-page-cars-section py-5 position-relative" id="cars">
        <div className="container position-relative z-index-1">
          <div className="section-header text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold display-5">Armada Unggulan Kami</h2>
            <p className="lead text-muted">Pilihan mobil premium untuk berbagai kebutuhan</p>
          </div>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-gold" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Memuat data mobil...</p>
            </div>
          ) : (
            <div className="row g-4">
              {popularCars.slice(0, 8).map((car, idx) => (
                <div className="col-12 col-md-6 col-lg-3 d-flex" key={car.id} data-aos="fade-up" data-aos-delay={idx * 100}>
                  <motion.div
                    className="home-page-car-card shadow-sm rounded-4 overflow-hidden border-0 h-100 d-flex flex-column w-100"
                    whileHover={{ y: -8, scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <div
                      className="home-page-car-img-container position-relative rounded-4 overflow-hidden mb-3"
                      style={{
                        aspectRatio: "16/9",
                        background: "#f3f4f6",
                        height: 180,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={car.gambar ? (car.gambar.startsWith("http") ? car.gambar : `${API_URL.replace(/\/api$/, "")}${car.gambar}`) : "/images/default-car.jpg"}
                        alt={car.nama}
                        className="img-fluid home-page-car-image"
                        style={{
                          objectFit: "contain",
                          objectPosition: "center",
                          width: "100%",
                          height: "100%",
                          maxHeight: 160,
                          background: "#fff",
                          padding: 10,
                          borderRadius: "1.2rem"
                        }}
                        loading="lazy"
                      />
                      {car.promo > 0 && (
                        <span className="badge bg-danger position-absolute top-0 start-0 m-3 px-3 py-2 shadow">
                          <i className="bi bi-bolt-fill me-1"></i>Promo {car.promo}%
                        </span>
                      )}
                      <span className="home-page-car-badge bg-gold text-white fw-bold rounded-pill px-3 py-1 position-absolute top-0 end-0 m-3">
                        POPULER
                      </span>
                    </div>
                    <div className="p-3 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>{car.nama}</h5>
                        <div className="home-page-car-rating text-gold small d-flex align-items-center">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`bi bi-star-fill${i < Math.round(car.rating || 0) ? "" : " text-secondary opacity-25"}`}
                              style={{ fontSize: "1rem" }}
                            />
                          ))}
                          <span className="ms-2 text-muted small">
                            {car.rating ? `${car.rating.toFixed(1)} (${car.jumlah_review || 0})` : "Belum ada rating"}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted mb-2" style={{ fontSize: "0.95rem" }}>
                        <i className="bi bi-gear me-1"></i> {car.transmisi || 'Automatic'} &nbsp;|&nbsp;
                        <i className="bi bi-people me-1"></i> {car.kapasitas || '4-6'} Orang
                      </p>
                      <div className="mb-2">
                        {car.promo > 0 ? (
                          <>
                            <span style={{ textDecoration: "line-through", color: "#bbb", marginRight: 6, fontSize: "0.95rem" }}>
                              Rp {car.harga?.toLocaleString('id-ID')}
                            </span>
                            <span className="fw-bold text-warning fs-5">
                              Rp {(car.harga - (car.harga * car.promo / 100)).toLocaleString('id-ID')}
                            </span>
                            <span className="text-muted ms-1">/hari</span>
                          </>
                        ) : (
                          <>
                            <span className="text-dark fw-bold fs-5">Rp {car.harga?.toLocaleString('id-ID') || '500.000'}</span>
                            <span className="text-muted ms-1">/hari</span>
                          </>
                        )}
                      </div>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {Array.isArray(car.fitur) && car.fitur.slice(0, 2).map((f, i) => (
                          <span key={i} className="badge bg-light text-dark border border-primary">
                            <i className="bi bi-check-circle text-success me-1"></i>{f}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto d-flex justify-content-center">
                        <Link
                          to={`/detail/${car.id}`}
                          className="btn btn-outline-primary-custom btn-sm rounded-pill fw-semibold d-flex align-items-center px-3 shadow-sm"
                          style={{
                            fontSize: "1rem",
                            height: 38,
                            letterSpacing: "0.2px",
                            borderWidth: 2,
                            transition: "background 0.2s, color 0.2s, box-shadow 0.2s"
                          }}
                        >
                          <i className="bi bi-info-circle me-2"></i>
                          Lihat Detail
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-5" data-aos="fade-up">
            <a href="/layanan" className="btn btn-gold btn-lg px-4 rounded-pill">
              Lihat Semua Armada <i className="bi bi-arrow-right ms-2"></i>
            </a>
          </div>
        </div>
      </section>

      {/* PROSES SEWA */}
<section className="home-page-process-section py-5 position-relative" style={{ backgroundColor: '#f8f9fa' }}>
  <div className="container position-relative z-index-1">
    <div className="section-header text-center mb-5" data-aos="fade-up">
      <h2 className="fw-bold display-5 mb-3" style={{ color: '#2c3e50' }}>Proses Sewa yang Mudah</h2>
      <p className="lead" style={{ color: '#7f8c8d', maxWidth: '700px', margin: '0 auto' }}>
        Hanya 4 langkah sederhana untuk mendapatkan mobil impian Anda
      </p>
    </div>
    
    <div className="row g-4 justify-content-center">
      {/* Step 1 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up">
        <div className="process-step-card glass-card p-4 rounded-3 h-100 text-center d-flex flex-column align-items-center shadow-sm hover-shadow transition-all" 
             style={{ backgroundColor: 'white', minHeight: '300px' }}>
          <div className="step-number mb-3 d-flex align-items-center justify-content-center rounded-circle" 
               style={{ width: '50px', height: '50px', backgroundColor: '#3498db', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            1
          </div>
          <div className="step-icon mb-3" style={{ fontSize: '2.5rem', color: '#3498db' }}>
            <i className="bi bi-car-front"></i>
          </div>
          <h5 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Pilih Mobil</h5>
          <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
            Cari dan pilih mobil sesuai kebutuhan Anda dari armada kami yang lengkap.
          </p>
        </div>
      </div>
      
      {/* Step 2 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
        <div className="process-step-card glass-card p-4 rounded-3 h-100 text-center d-flex flex-column align-items-center shadow-sm hover-shadow transition-all" 
             style={{ backgroundColor: 'white', minHeight: '300px' }}>
          <div className="step-number mb-3 d-flex align-items-center justify-content-center rounded-circle" 
               style={{ width: '50px', height: '50px', backgroundColor: '#2ecc71', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            2
          </div>
          <div className="step-icon mb-3" style={{ fontSize: '2.5rem', color: '#2ecc71' }}>
            <i className="bi bi-file-earmark-text"></i>
          </div>
          <h5 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Pesan Online</h5>
          <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
            Isi formulir pemesanan dengan detail perjalanan Anda secara mudah dan cepat.
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="100">
        <div className="process-step-card glass-card p-4 rounded-3 h-100 text-center d-flex flex-column align-items-center shadow-sm hover-shadow transition-all"
             style={{ backgroundColor: 'white', minHeight: '300px' }}>
          <div className="step-number mb-3 d-flex align-items-center justify-content-center rounded-circle"
               style={{ width: '50px', height: '50px', backgroundColor: '#2ecc71', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            3
          </div>
          {/* Icon utama konfirmasi di dalam card */}
          <div className="step-icon mb-3 d-flex align-items-center justify-content-center"
               style={{ fontSize: '2.5rem', color: '#2ecc71', background: '#eafaf1', borderRadius: '50%', width: 60, height: 60, margin: '0 auto' }}>
            <i className="bi bi-patch-check-fill"></i>
          </div>
          <h5 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Konfirmasi</h5>
          <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
            Tim kami akan menghubungi Anda untuk verifikasi pesanan dalam waktu cepat.
          </p>
        </div>
      </div>
      
      
      
      {/* Step 4 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
        <div className="process-step-card glass-card p-4 rounded-3 h-100 text-center d-flex flex-column align-items-center shadow-sm hover-shadow transition-all" 
             style={{ backgroundColor: 'white', minHeight: '300px' }}>
          <div className="step-number mb-3 d-flex align-items-center justify-content-center rounded-circle" 
               style={{ width: '50px', height: '50px', backgroundColor: '#9b59b6', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            4
          </div>
          <div className="step-icon mb-3" style={{ fontSize: '2.5rem', color: '#9b59b6' }}>
            <i className="bi bi-key"></i>
          </div>
          <h5 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Ambil Mobil</h5>
          <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
            Mobil siap digunakan sesuai waktu dan lokasi yang telah disepakati.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* TESTIMONI */}
      <section className="home-page-testimonials-section py-5 position-relative" style={{ background: "linear-gradient(90deg, #f8fafc 0%, #e7e9ef 100%)" }}>
  <div className="container position-relative z-index-1">
    <div className="section-header text-center mb-5" data-aos="fade-up">
      <h2 className="fw-bold display-5 text-gradient" style={{ letterSpacing: "1px" }}>
        Apa Kata Pelanggan Kami?
      </h2>
      <p className="lead text-secondary" style={{ fontWeight: 500 }}>
        Testimoni jujur dari pelanggan yang puas
      </p>
    </div>
    <Carousel indicators={false} interval={5000} className="testimonial-carousel" data-aos="fade-up">
      {testimonials.length > 0 ? (
        testimonials.slice(0, 6).map((t, idx) => (
          <Carousel.Item key={t.id}>
            <div
              className="home-page-testimonial-card glass-card p-5 rounded-4 shadow border-0 bg-white mx-auto text-center"
              style={{
                maxWidth: 650,
                border: "1.5px solid #f1c40f22",
                boxShadow: "0 8px 32px rgba(212,175,55,0.07)",
              }}
            >
              <div className="home-page-testimonial-rating mb-3">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="bi bi-star-fill text-gold mx-1 fs-5"></i>
                ))}
              </div>
              <p
                className="home-page-testimonial-text lead mb-4 fst-italic"
                style={{
                  color: "#222",
                  fontSize: "1.25rem",
                  lineHeight: 1.6,
                  fontWeight: 500,
                  textShadow: "0 1px 0 #fff8",
                }}
              >
                “{t.pesan}”
              </p>
              <div className="home-page-testimonial-author d-flex align-items-center justify-content-center mt-4">
                <div
                  className="home-page-author-avatar rounded-circle bg-gold d-flex align-items-center justify-content-center me-3 shadow"
                  style={{
                    width: 56,
                    height: 56,
                    border: "3px solid #fff",
                    boxShadow: "0 2px 8px #ffd70033",
                  }}
                >
                  <i className="bi bi-person-fill text-white fs-3"></i>
                </div>
                <div className="text-start">
                  <h6 className="fw-bold mb-0" style={{ color: "#1e3c72" }}>{t.nama}</h6>
                  <small className="text-muted">{t.lokasi || 'Pelanggan Setia'}</small>
                </div>
              </div>
            </div>
          </Carousel.Item>
        ))
      ) : (
        <Carousel.Item>
          <div className="text-center py-4">
            <p className="text-muted">Belum ada testimoni</p>
          </div>
        </Carousel.Item>
      )}
    </Carousel>
  </div>
</section>

      {/* FAQ */}
      <section className="home-page-faq-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 mb-5 mb-lg-0" data-aos="fade-right">
              <div className="section-header mb-4">
                <h2 className="fw-bold display-5">Pertanyaan Umum</h2>
                <p className="lead text-muted">Temukan jawaban untuk pertanyaan yang sering diajukan</p>
              </div>
             
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <Accordion flush className="shadow-sm rounded-4 overflow-hidden">
  {/* FAQ Supir & Lepas Kunci */}
  <Accordion.Item eventKey="0" className="border-0 border-bottom">
    <Accordion.Header className="fw-bold">
      <i className="bi bi-question-circle text-gold me-2"></i>
      Apakah rental sudah termasuk supir? Apakah bisa lepas kunci?
    </Accordion.Header>
    <Accordion.Body className="bg-light">
      <b>Semua layanan kami sudah termasuk supir profesional.</b> Kami <span className="text-danger fw-semibold">tidak melayani sewa lepas kunci (tanpa supir)</span> demi keamanan dan kenyamanan pelanggan.
    </Accordion.Body>
  </Accordion.Item>
  {/* FAQ Pembayaran */}
  <Accordion.Item eventKey="1" className="border-0 border-bottom">
    <Accordion.Header className="fw-bold">
      <i className="bi bi-question-circle text-gold me-2"></i>
      Bagaimana cara pembayaran?
    </Accordion.Header>
    <Accordion.Body className="bg-light">
      Kami menerima berbagai metode pembayaran termasuk transfer bank (BCA, Mandiri, BRI), e-wallet (OVO, GoPay, DANA), kartu kredit, atau tunai saat pengambilan mobil dengan deposit.
    </Accordion.Body>
  </Accordion.Item>
  {/* FAQ Asuransi */}
  <Accordion.Item eventKey="2" className="border-0 border-bottom">
    <Accordion.Header className="fw-bold">
      <i className="bi bi-question-circle text-gold me-2"></i>
      Apakah harga sudah termasuk asuransi?
    </Accordion.Header>
    <Accordion.Body className="bg-light">
      Semua paket sewa sudah termasuk asuransi dasar (TLO - Total Loss Only). Anda bisa menambah asuransi comprehensive dengan biaya tambahan untuk perlindungan lebih lengkap.
    </Accordion.Body>
  </Accordion.Item>
  {/* FAQ Kerusakan */}
  <Accordion.Item eventKey="3" className="border-0">
    <Accordion.Header className="fw-bold">
      <i className="bi bi-question-circle text-gold me-2"></i>
      Bagaimana jika mobil mengalami kerusakan?
    </Accordion.Header>
    <Accordion.Body className="bg-light">
      Segera hubungi tim support kami 24 jam. Untuk kerusakan kecil, biaya perbaikan akan ditanggung deposit. Untuk kerusakan besar, asuransi akan menanggung sesuai polis. Kami juga menyediakan mobil pengganti jika diperlukan.
    </Accordion.Body>
  </Accordion.Item>
</Accordion>
              
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="home-page-cta-section-gold py-5 position-relative">
        <div className="container position-relative z-index-1 text-center py-5">
          <h2 className="display-5 fw-bold text-dark mb-3" data-aos="fade-up">
            Siap Memulai Perjalanan Anda?
          </h2>
          <p className="lead text-dark mb-5" data-aos="fade-up" data-aos-delay="100">
            Pesan sekarang dan dapatkan pengalaman berkendara yang tak terlupakan dengan layanan premium kami.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3" data-aos="fade-up" data-aos-delay="200">
            <Link
              to="#cars"
              className="btn btn-primary-custom btn-lg px-4 py-3 fw-bold rounded-pill"
            >
              <i className="bi bi-car-front me-2"></i>Pilih Mobil
            </Link>
            <a
              href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
              className="btn btn-outline-accent btn-lg px-4 py-3 fw-bold rounded-pill"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-whatsapp me-2"></i>Chat Sekarang
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;