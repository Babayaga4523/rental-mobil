import React, { useEffect, useState } from "react";
import { Accordion, Carousel } from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/HomePage.css";

const Home = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [popularCars, setPopularCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [counters, setCounters] = useState({ cars: 0, customers: 0, years: 0 });

  const phoneNumber = "6281381339149";
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

    fetch("http://localhost:3000/api/testimoni")
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(err => console.error("Error fetching testimonials:", err));

    fetch("http://localhost:3000/api/layanan?limit=8")
      .then(res => res.json())
      .then(data => {
        setPopularCars(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => console.error("Error fetching cars:", err));
  }, []);

  return (
    <div className="home-page-root">
      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
        className="home-page-wa-float shadow-lg"
        target="_blank"
        rel="noopener noreferrer"
        title="Chat via WhatsApp"
        data-aos="fade-left"
      >
        <img src="/images/wa.svg" alt="WhatsApp" width="40" />
        <span className="ms-2 d-none d-sm-inline">Hubungi Kami</span>
      </a>

      {/* HERO SECTION */}
      <section className="home-page-hero-section position-relative d-flex align-items-center">
        <div className="home-page-hero-overlay"></div>
        <div className="container home-page-hero-content position-relative z-index-1">
          <div className="row align-items-center">
            <div className="col-lg-6" data-aos="fade-right">
              <h1 className="home-page-hero-title mb-4 fw-bold display-4">
                Sewa Mobil <span className="text-gradient">Premium</span> dengan Layanan Terbaik
              </h1>
              <p className="home-page-hero-subtitle mb-4 lead">
                Solusi transportasi profesional untuk perjalanan bisnis, liburan, atau acara khusus. Armada terawat dengan standar tinggi dan pelayanan prima.
              </p>
              <div className="home-page-hero-cta mb-4 d-flex flex-wrap gap-3">
                <a
                  href="#cars"
                  className="btn btn-gold btn-lg px-4 py-3 fw-bold rounded-pill"
                >
                  <i className="bi bi-car-front me-2"></i>Lihat Armada
                </a>
                <a
                  href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
                  className="btn btn-outline-light btn-lg px-4 py-3 fw-bold rounded-pill"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-whatsapp me-2"></i>Konsultasi Gratis
                </a>
              </div>
              <div className="d-flex flex-column gap-2 mt-3">
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-gold me-2"></i>
                  <span>Driver profesional & berpengalaman</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-gold me-2"></i>
                  <span>Armada terbaru & kondisi prima</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-circle-fill text-gold me-2"></i>
                  <span>Dukungan 24/7 selama penyewaan</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block" data-aos="fade-left" data-aos-delay="300">
              <div className="home-page-hero-img-container position-relative">
                <img
                  src="/images/hero-car.png"
                  alt="Rental Mobil Premium"
                  className="img-fluid home-page-hero-img"
                />
                <div className="home-page-hero-badge bg-gold text-dark fw-bold rounded-pill p-2 px-3 shadow">
                  <i className="bi bi-star-fill me-1"></i> Rating 4.9/5.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COUNTERS */}
      <section className="home-page-counters-section py-5 bg-white position-relative">
        <div className="container position-relative z-index-1">
          <div className="row g-4 justify-content-center">
            <div className="col-md-4" data-aos="fade-up">
              <div className="home-page-counter-card p-4 rounded-4 shadow-sm border-0 text-center bg-white">
                <div className="home-page-counter-number display-4 fw-bold mb-2">{counters.cars}+</div>
                <h5 className="home-page-counter-label fw-semibold">Armada Mobil</h5>
                <p className="text-muted mb-0">Berbagai jenis & kelas</p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="100">
              <div className="home-page-counter-card p-4 rounded-4 shadow-sm border-0 text-center bg-white">
                <div className="home-page-counter-number display-4 fw-bold mb-2">{counters.customers}+</div>
                <h5 className="home-page-counter-label fw-semibold">Pelanggan</h5>
                <p className="text-muted mb-0">Telah mempercayai kami</p>
              </div>
            </div>
            <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
              <div className="home-page-counter-card p-4 rounded-4 shadow-sm border-0 text-center bg-white">
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
    </div>
    
    <div className="row g-4">
      {/* Feature 1 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up">
        <div className="feature-card p-4 rounded-3 h-100 text-center transition-all"
             style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', height: '100%' }}>
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
        <div className="feature-card p-4 rounded-3 h-100 text-center transition-all"
             style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', height: '100%' }}>
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
        <div className="feature-card p-4 rounded-3 h-100 text-center transition-all"
             style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', height: '100%' }}>
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
        <div className="feature-card p-4 rounded-3 h-100 text-center transition-all"
             style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', height: '100%' }}>
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
                <div className="col-md-6 col-lg-3" key={car.id} data-aos="fade-up" data-aos-delay={idx * 100}>
                  <div className="home-page-car-card shadow-sm rounded-4 overflow-hidden border-0 h-100">
                    <div className="home-page-car-img-container position-relative">
                      <img
                        src={car.gambar ? (car.gambar.startsWith("http") ? car.gambar : "http://localhost:3000" + car.gambar) : "/images/default-car.jpg"}
                        alt={car.nama}
                        className="img-fluid w-100 home-page-car-image"
                      />
                      <div className="home-page-car-badge bg-gold text-white fw-bold rounded-pill px-3 py-1 position-absolute top-0 end-0 m-3">
                        POPULER
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="fw-bold mb-1">{car.nama}</h5>
                        <div className="home-page-car-rating text-gold small">
                          <i className="bi bi-star-fill"></i> 4.8
                        </div>
                      </div>
                      <p className="text-muted mb-3">
                        <i className="bi bi-gear me-1"></i> {car.transmisi || 'Automatic'} • 
                        <i className="bi bi-people me-1 ms-2"></i> {car.kapasitas || '4-6'} Orang
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="text-dark fw-bold">Rp {car.harga?.toLocaleString('id-ID') || '500.000'}</span>
                          <span className="text-muted small"> /hari</span>
                        </div>
                        <a
                          href={`/detail-mobil/${car.id}`}
                          className="btn btn-sm btn-outline-gold rounded-pill px-3"
                        >
                          Detail
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-5" data-aos="fade-up">
            <a href="/mobil" className="btn btn-gold btn-lg px-4 rounded-pill">
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
        <div className="process-step-card p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center shadow-sm hover-shadow transition-all" 
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
        <div className="process-step-card p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center shadow-sm hover-shadow transition-all" 
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
      <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="200">
        <div className="process-step-card p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center shadow-sm hover-shadow transition-all" 
             style={{ backgroundColor: 'white', minHeight: '300px' }}>
          <div className="step-number mb-3 d-flex align-items-center justify-content-center rounded-circle" 
               style={{ width: '50px', height: '50px', backgroundColor: '#e67e22', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
            3
          </div>
          <div className="step-icon mb-3" style={{ fontSize: '2.5rem', color: '#e67e22' }}>
            <i className="bi bi-telephone-check"></i>
          </div>
          <h5 className="home-page-step-icon mb-3" style={{ color: '#2c3e50' }}>Konfirmasi</h5>
          <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
            Tim kami akan menghubungi Anda untuk verifikasi pesanan dalam waktu cepat.
          </p>
        </div>
      </div>
      
      {/* Step 4 */}
      <div className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay="300">
        <div className="process-step-card p-4 rounded-4 h-100 text-center d-flex flex-column align-items-center shadow-sm hover-shadow transition-all" 
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
      <section className="home-page-testimonials-section py-5 position-relative">
        <div className="container position-relative z-index-1">
          <div className="section-header text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold display-5">Apa Kata Pelanggan Kami?</h2>
            <p className="lead text-muted">Testimoni jujur dari pelanggan yang puas</p>
          </div>
          <Carousel indicators={false} interval={5000} className="testimonial-carousel" data-aos="fade-up">
            {testimonials.length > 0 ? (
              testimonials.slice(0, 6).map((t, idx) => (
                <Carousel.Item key={t.id}>
                  <div className="home-page-testimonial-card p-5 rounded-4 shadow-sm border-0 bg-white mx-auto text-center">
                    <div className="home-page-testimonial-rating mb-3">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="bi bi-star-fill text-gold mx-1"></i>
                      ))}
                    </div>
                    <p className="home-page-testimonial-text lead mb-4 fst-italic">"{t.pesan}"</p>
                    <div className="home-page-testimonial-author d-flex align-items-center justify-content-center">
                      <div className="home-page-author-avatar rounded-circle bg-light d-flex align-items-center justify-content-center me-3">
                        <i className="bi bi-person-fill text-gold fs-4"></i>
                      </div>
                      <div className="text-start">
                        <h6 className="fw-bold mb-0">{t.nama}</h6>
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

      {/* PARTNER */}
      <section className="home-page-partner-section py-5 bg-light">
        <div className="container">
          <div className="section-header text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold display-5">Dipercaya Oleh</h2>
            <p className="lead text-muted">Perusahaan dan institusi terkemuka</p>
          </div>
          <div className="home-page-partner-logos d-flex flex-wrap justify-content-center align-items-center gap-5" data-aos="fade-up">
            <img src="/images/partner1.png" alt="Partner 1" className="img-fluid" />
            <img src="/images/partner2.png" alt="Partner 2" className="img-fluid" />
            <img src="/images/partner3.png" alt="Partner 3" className="img-fluid" />
            <img src="/images/partner4.png" alt="Partner 4" className="img-fluid" />
          </div>
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
              <img src="/images/faq-image.jpg" alt="FAQ" className="img-fluid rounded-4 shadow-sm" />
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <Accordion flush className="shadow-sm rounded-4 overflow-hidden">
                <Accordion.Item eventKey="0" className="border-0 border-bottom">
                  <Accordion.Header className="fw-bold">
                    <i className="bi bi-question-circle text-gold me-2"></i>
                    Apakah bisa sewa tanpa supir?
                  </Accordion.Header>
                  <Accordion.Body className="bg-light">
                    Ya, kami menyediakan opsi sewa mobil lepas kunci (tanpa supir) untuk pelanggan yang memenuhi persyaratan usia minimal 21 tahun dan memiliki SIM A yang masih berlaku.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1" className="border-0 border-bottom">
                  <Accordion.Header className="fw-bold">
                    <i className="bi bi-question-circle text-gold me-2"></i>
                    Bagaimana cara pembayaran?
                  </Accordion.Header>
                  <Accordion.Body className="bg-light">
                    Kami menerima berbagai metode pembayaran termasuk transfer bank (BCA, Mandiri, BRI), e-wallet (OVO, GoPay, DANA), kartu kredit, atau tunai saat pengambilan mobil dengan deposit.
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2" className="border-0 border-bottom">
                  <Accordion.Header className="fw-bold">
                    <i className="bi bi-question-circle text-gold me-2"></i>
                    Apakah harga sudah termasuk asuransi?
                  </Accordion.Header>
                  <Accordion.Body className="bg-light">
                    Semua paket sewa sudah termasuk asuransi dasar (TLO - Total Loss Only). Anda bisa menambah asuransi comprehensive dengan biaya tambahan untuk perlindungan lebih lengkap.
                  </Accordion.Body>
                </Accordion.Item>
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
              <div className="text-center mt-4">
                <a href="/faq" className="btn btn-outline-gold rounded-pill">
                  Lihat FAQ Lainnya <i className="bi bi-arrow-right ms-2"></i>
                </a>
              </div>
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
            <a
              href="#cars"
              className="btn btn-dark btn-lg px-4 py-3 fw-bold rounded-pill"
            >
              <i className="bi bi-car-front me-2"></i>Pilih Mobil
            </a>
            <a
              href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
              className="btn btn-outline-dark btn-lg px-4 py-3 fw-bold rounded-pill"
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