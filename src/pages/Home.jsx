import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../style/Home.css";
import { Accordion } from "react-bootstrap";

const Home = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [popularCars, setPopularCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const phoneNumber = "6281381339149";
  const message = "Halo! Saya tertarik dengan layanan sewa mobil Anda. Bisa minta info lebih lanjut? 🚘";

  useEffect(() => {
    AOS.init({ 
      duration: 1000, 
      once: true,
      easing: 'ease-out-cubic'
    });
    
    // Fetch testimonials
    fetch("http://localhost:3000/api/testimoni")
      .then(res => res.json())
      .then(data => setTestimonials(data))
      .catch(err => console.error("Error fetching testimonials:", err));

    // Fetch popular cars
    fetch("http://localhost:3000/api/layanan?limit=6")
      .then(res => res.json())
      .then(data => {
        setPopularCars(data);
        setIsLoading(false);
      })
      .catch(err => console.error("Error fetching cars:", err));
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };

  const features = [
    { icon: "🚗", title: "Armada Terbaru", desc: "Mobil-mobil terawat dengan model terkini" },
    { icon: "💰", title: "Harga Kompetitif", desc: "Tarif terjangkau dengan kualitas premium" },
    { icon: "⏱️", title: "Proses Cepat", desc: "Pemesanan mudah hanya dalam 5 menit" },
    { icon: "🛡️", title: "Asuransi Lengkap", desc: "Proteksi maksimal untuk kenyamanan Anda" },
    { icon: "📍", title: "Jangkauan Luas", desc: "Layanan antar-jemput di seluruh kota" },
    { icon: "📞", title: "Dukungan 24/7", desc: "Tim siap membantu kapan saja" }
  ];

  const steps = [
    { number: 1, title: "Pilih Mobil", desc: "Telusuri koleksi mobil kami dan pilih yang sesuai kebutuhan" },
    { number: 2, title: "Pesan Online", desc: "Isi formulir pemesanan dengan detail perjalanan Anda" },
    { number: 3, title: "Konfirmasi", desc: "Tim kami akan menghubungi Anda untuk konfirmasi" },
    { number: 4, title: "Ambil Mobil", desc: "Mobil siap digunakan sesuai waktu yang disepakati" }
  ];

  const faqs = [
    {
      question: "Bagaimana cara menyewa mobil?",
      answer: "Proses penyewaan sangat mudah. Anda bisa memilih mobil di website kami, lalu isi formulir pemesanan. Tim kami akan menghubungi Anda untuk konfirmasi."
    },
    {
      question: "Apa saja persyaratan untuk menyewa mobil?",
      answer: "Anda perlu menyiapkan KTP/SIM asli, kartu kredit (untuk deposit), dan bukti alamat. Untuk penyewa asing, paspor dan SIM internasional diperlukan."
    },
    {
      question: "Berapa lama proses pengambilan mobil?",
      answer: "Proses pengambilan mobil biasanya memakan waktu sekitar 15-30 menit setelah semua dokumen diverifikasi dan pembayaran diterima."
    },
    {
      question: "Apakah ada batasan jarak tempuh?",
      answer: "Kami memberikan jarak tempuh gratis sesuai paket yang dipilih. Untuk jarak tempuh tambahan akan dikenakan biaya sesuai ketentuan."
    },
    {
      question: "Bagaimana jika terjadi kecelakaan?",
      answer: "Segera hubungi tim kami 24/7. Mobil kami sudah dilengkapi asuransi komprehensif dengan syarat dan ketentuan berlaku."
    }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container">
          <div className="hero-content">
            <motion.h1 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="hero-title"
            >
              Sewa Mobil Premium <span>Dengan Kenyamanan Maksimal</span>
            </motion.h1>
            <p className="hero-subtitle">
              Temukan solusi transportasi terbaik untuk perjalanan bisnis maupun liburan Anda
            </p>
            <div className="hero-cta">
              <button 
                onClick={() => handleNavigate("/layanan")}
                className="btn btn-primary"
              >
                Lihat Armada Kami
              </button>
              <a 
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                Konsultasi Sekarang
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Mengapa Memilih Kami?</h2>
            <p>Keunggulan yang membuat kami berbeda</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Cars Section */}
      <section className="cars-section">
        <div className="container">
          <div className="section-header text-center">
            <h2>Galeri Mobil</h2>
            <p>Pilihan terbaik pelanggan kami</p>
          </div>

          <div className="cars-grid">
            {popularCars.slice(0, 6).map((car, index) => (
              <div
                key={car.id}
                className="car-card"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="car-image">
                  <img src={car.gambar} alt={car.nama} className="img-fluid" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="process-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="fw-bold">Cara Penyewaan</h2>
            <p className="lead">Hanya 4 langkah mudah untuk mendapatkan mobil</p>
          </div>
          
          <div className="row g-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="col-md-3 col-sm-6 process-step"
                data-aos="fade-up"
                data-aos-delay={index * 150}
              >
                <div className="step-card p-4 text-center shadow rounded">
                  <div className="step-number mb-3">
                    <span className="fw-bold fs-3">{step.number}</span>
                  </div>
                  <div className="step-content">
                    <h3 className="h5 mb-3">{step.title}</h3>
                    <p className="text-muted">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-5 bg-light">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="fw-bold">Pertanyaan Umum</h2>
            <p className="lead">Temukan jawaban untuk pertanyaan Anda</p>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <Accordion defaultActiveKey="0" data-aos="fade-up">
                {faqs.map((faq, index) => (
                  <Accordion.Item 
                    eventKey={index.toString()} 
                    key={index} 
                    className="mb-3 border-0 shadow-sm rounded overflow-hidden"
                  >
                    <Accordion.Header className="bg-white p-3">
                      <h3 className="h5 mb-0 fw-bold">{faq.question}</h3>
                    </Accordion.Header>
                    <Accordion.Body className="p-3 bg-white">
                      <p className="mb-0">{faq.answer}</p>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
              
              <div className="text-center mt-5" data-aos="fade-up">
                <p className="mb-4">Masih ada pertanyaan? Tim kami siap membantu!</p>
                <a
                  href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
                  className="btn btn-primary px-4 py-2 rounded-pill fw-semibold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hubungi Kami Sekarang
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section py-5">
        <div className="container">
          <div className="section-header text-center mb-5">
            <h2 className="fw-bold">Apa Kata Pelanggan?</h2>
            <p className="lead">Testimoni jujur dari pelanggan kami</p>
          </div>

          <div className="testimonials-slider">
            {testimonials.length > 0 ? (
              <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
                <div className="carousel-inner">
                  {testimonials.slice(0, 5).map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className={`carousel-item ${index === 0 ? 'active' : ''}`}
                    >
                      <div className="testimonial-card text-center p-4 shadow-sm rounded">
                        <div className="testimonial-rating mb-3">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-warning">★</span>
                          ))}
                        </div>
                        <p className="testimonial-text mb-4">"{testimonial.pesan}"</p>
                        <div className="testimonial-author">
                          <h4 className="fw-semibold">{testimonial.nama}</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="carousel-control-prev"
                  type="button"
                  data-bs-target="#testimonialCarousel"
                  data-bs-slide="prev"
                >
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button
                  className="carousel-control-next"
                  type="button"
                  data-bs-target="#testimonialCarousel"
                  data-bs-slide="next"
                >
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            ) : (
              <p className="text-center">Belum ada testimoni</p>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <div className="cta-content text-center">
            <h2 className="display-4 fw-bold text-primary mb-4">Siap Memesan Mobil Impian Anda?</h2>
            <p className="lead text-muted mb-4">Hubungi kami sekarang dan dapatkan penawaran terbaik!</p>
            
            <div className="cta-buttons d-flex justify-content-center gap-3">
              <button
                onClick={() => handleNavigate("/layanan")}
                className="btn btn-primary px-4 py-2 rounded-pill fw-semibold"
              >
                Lihat Daftar Mobil
              </button>
              <a
                href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
                className="btn btn-success px-4 py-2 rounded-pill fw-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;