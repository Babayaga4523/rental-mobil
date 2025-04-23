import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userData") || '{}');

  const phoneNumber = "6281381339149";
  const message =
    "Halo! Saya tertarik dengan layanan sewa mobil Anda. Bisa minta info lebih lanjut? 🚘";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    navigate("/login");
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    fetch("http://localhost:3000/api/testimoni")
      .then((res) => res.json())
      .then((data) => {
        setTestimonials(data);
      })
      .catch((error) => {
        console.error("Gagal fetch testimoni:", error);
      });
  }, []);

  const handleNavigateToLayanan = (e) => {
    e.preventDefault();
    navigate("/layanan");
  };

  const galleryImages = [
    "/images/mobil1.jpg",
    "/images/mobil2.jpg",
    "/images/mobil3.jpg",
    "/images/mobil4.jpg",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="container-fluid p-0"
    >
     
      {/* Hero Section */}
      <section
        className="hero-section text-center text-white d-flex align-items-center justify-content-center py-5"
        style={{
          background: "linear-gradient(135deg, #1d3557, #457b9d)",
          minHeight: "80vh",
        }}
      >
        <div className="container">
          <div className="content" data-aos="fade-up">
            <h1 className="fw-bold display-3 mb-3">
              🚘 Sewa Mobil Mudah & Cepat
            </h1>
            <p className="lead mb-4">
              Temukan mobil impian Anda dengan harga terbaik dan pelayanan
              terpercaya!
            </p>
            <a
              href="#layanan"
              onClick={handleNavigateToLayanan}
              className="btn btn-warning fw-semibold px-4 py-2 rounded-pill"
              data-aos="zoom-in"
            >
              Cari Mobil Sekarang
            </a>
          </div>
        </div>
      </section>

      {/* Layanan Unggulan */}
      <section id="layanan" className="services py-5 bg-light text-center">
        <h2 className="fw-bold" data-aos="fade-up">
          ✨ Kenapa Memilih Kami?
        </h2>
        <div className="row mt-4">
          {[
            "Harga Terjangkau",
            "Armada Terbaru",
            "Proses Mudah",
            "Layanan 24/7",
          ].map((item, index) => (
            <div
              className="col-md-3"
              data-aos="fade-up"
              data-aos-delay={index * 100}
              key={index}
            >
              <h5>✅ {item}</h5>
              <p>Pelayanan terbaik dengan harga bersaing</p>
            </div>
          ))}
        </div>
      </section>

      {/* Galeri Mobil */}
      <section className="gallery py-5 text-center">
        <div className="container">
          <h2 className="fw-bold mb-4" data-aos="fade-up">
            🚗 Galeri Mobil Kami
          </h2>
          <div className="row">
            {galleryImages.map((img, index) => (
              <div
                className="col-md-3 mb-3"
                key={index}
                data-aos="zoom-in"
                data-aos-delay={index * 150}
              >
                <img
                  src={img}
                  alt={`Mobil ${index + 1}`}
                  className="img-fluid rounded shadow"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section className="how-it-works py-5 bg-white text-center">
        <div className="container">
          <h2 className="fw-bold mb-4" data-aos="fade-up">
            🔧 Cara Kerja Kami
          </h2>
          <div className="row">
            {[
              {
                icon: "📝",
                title: "1. Pilih Mobil",
                desc: "Telusuri armada dan pilih sesuai kebutuhan.",
              },
              {
                icon: "📅",
                title: "2. Tentukan Tanggal",
                desc: "Pilih tanggal & waktu penyewaan.",
              },
              {
                icon: "📞",
                title: "3. Hubungi Kami",
                desc: "Booking via WhatsApp atau telepon.",
              },
              {
                icon: "🛣️",
                title: "4. Nikmati Perjalanan",
                desc: "Mobil akan diantar atau siap dijemput.",
              },
            ].map((step, i) => (
              <div
                className="col-md-3 mb-4"
                data-aos="fade-up"
                data-aos-delay={i * 150}
                key={i}
              >
                <div className="p-3 border rounded h-100 shadow-sm">
                  <div className="display-4">{step.icon}</div>
                  <h5 className="fw-bold mt-3">{step.title}</h5>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistik Kepercayaan */}
      <section
        className="stats py-5 text-white"
        style={{ background: "#1d3557" }}
      >
        <div className="container text-center">
          <h2 className="fw-bold mb-4" data-aos="fade-up">
            📈 Angka yang Berbicara
          </h2>
          <div className="row">
            {[
              { number: "1.200+", label: "Pelanggan Puas" },
              { number: "150+", label: "Unit Tersedia" },
              { number: "4.9★", label: "Rating Google" },
              { number: "5 Tahun", label: "Pengalaman" },
            ].map((item, i) => (
              <div
                className="col-md-3 mb-3"
                key={i}
                data-aos="fade-up"
                data-aos-delay={i * 150}
              >
                <h3 className="display-5 fw-bold">{item.number}</h3>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="testimonials py-5 bg-light">
        <div className="container text-center" data-aos="fade-up">
          <h2 className="fw-bold mb-4">💬 Testimoni Pelanggan</h2>
          <div
            id="carouselTestimonials"
            className="carousel slide"
            data-bs-ride="carousel"
            data-bs-interval="3000"
          >
            <div className="carousel-inner">
              {testimonials.map((item, index) => (
                <div
                  key={item.id}
                  className={`carousel-item ${index === 0 ? "active" : ""}`}
                >
                  <p className="fst-italic fs-5">{item.text}</p>
                  <span className="fw-semibold">- {item.name}</span>
                </div>
              ))}
            </div>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target="#carouselTestimonials"
              data-bs-slide="prev"
            >
              <span
                className="carousel-control-prev-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target="#carouselTestimonials"
              data-bs-slide="next"
            >
              <span
                className="carousel-control-next-icon"
                aria-hidden="true"
              ></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq py-5 bg-light">
        <div className="container">
          <h2 className="fw-bold text-center mb-4" data-aos="fade-up">
            ❓ Pertanyaan Umum
          </h2>
          <div className="accordion" id="faqAccordion">
            {[
              {
                question: "Apa saja syarat untuk menyewa mobil?",
                answer:
                  "Cukup siapkan KTP & SIM aktif. Untuk penyewaan jangka panjang, bisa dikenakan tambahan dokumen.",
              },
              {
                question: "Apakah bisa sewa dengan supir?",
                answer:
                  "Tentu! Kami menyediakan layanan dengan atau tanpa supir sesuai kebutuhan Anda.",
              },
              {
                question: "Bisa antar-jemput mobil ke lokasi saya?",
                answer:
                  "Ya, kami menyediakan layanan antar-jemput mobil ke lokasi Anda dengan biaya tambahan.",
              },
            ].map((item, i) => (
              <div className="accordion-item" key={i} data-aos="fade-up">
                <h2 className="accordion-header" id={`heading${i}`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${i}`}
                    aria-expanded="false"
                    aria-controls={`collapse${i}`}
                  >
                    {item.question}
                  </button>
                </h2>
                <div
                  id={`collapse${i}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading${i}`}
                  data-bs-parent="#faqAccordion"
                >
                  <div className="accordion-body">{item.answer}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp Contact */}
      <section
        className="contact py-5"
        style={{ backgroundColor: "#0f172a", color: "#fff" }}
      >
        <div className="container text-center" data-aos="zoom-in">
          <h2 className="fw-bold mb-3">💬 Butuh Bantuan?</h2>
          <p className="fs-5 mb-4">
            Kami siap membantu Anda! Hubungi kami langsung melalui WhatsApp:
          </p>
          <a
            href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(
              message
            )}`}
            className="btn btn-success px-4 py-2 rounded-pill fw-semibold shadow"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "1.1rem" }}
          >
            📲 Chat Sekarang
          </a>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
