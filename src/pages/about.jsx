import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { 
  FaStar, FaCar, FaThumbsUp, FaHandHoldingHeart, FaShieldAlt, 
  FaClock, FaTag, FaMapMarkerAlt, FaAward, FaSmile, FaHeadset, 
  FaUserTie, FaPhoneAlt, FaEnvelope, FaFacebook, FaInstagram, 
  FaTwitter, FaLinkedin, FaPaperPlane, FaRoad, FaChartLine,
  FaUsers, FaCalendarAlt, FaRegHandshake
} from "react-icons/fa";
import "../style/About.css";

const About = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out-quad'
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const phone = "6281294743876";
    const text = 
      `Halo Admin Rental Mobil HS!\n\n` +
      `Nama: ${form.name}\n` +
      `Email: ${form.email}\n` +
      `Subjek: ${form.subject}\n` +
      `Pesan: ${form.message}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="about-page"
    >
      {/* HERO SECTION */}
      <section className="about-hero position-relative overflow-hidden">
        <div className="hero-overlay"></div>
        <div className="container h-100 position-relative z-2">
          <div className="row h-100 align-items-center py-8">
            <div className="col-lg-8 mx-auto text-center">
              <motion.div 
                className="mb-4" 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="badge bg-white text-primary fs-6 px-4 py-2 shadow-sm">
                  <FaStar className="me-2" />
                  <span className="fw-bold">Premium Car Rental</span>
                </span>
              </motion.div>
              
              <motion.h1 
                className="display-2 fw-bold mb-4 text-white" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Selamat Datang di <span className="text-gold">Rental Mobil HS</span>
              </motion.h1>
              
              <motion.p 
                className="lead text-light mb-5" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ maxWidth: "700px", margin: "0 auto" }}
              >
                Menyediakan solusi transportasi premium sejak 2000 dengan komitmen pada kualitas, keamanan, dan kepuasan pelanggan
              </motion.p>
              
              <motion.div 
                className="d-flex flex-wrap justify-content-center gap-3" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button 
                  className="btn btn-primary btn-lg rounded-pill px-4 py-3"
                  onClick={() => navigate("/layanan")}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(13, 110, 253, 0.25)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCar className="me-2" />Lihat Armada
                </motion.button>
                <motion.button 
                  className="btn btn-outline-light btn-lg rounded-pill px-4 py-3 border-2"
                  onClick={() => document.getElementById('contact-section').scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPhoneAlt className="me-2" />Hubungi Kami
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
        
        <div className="hero-shape-divider">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="shape-fill"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" className="shape-fill"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="shape-fill"></path>
          </svg>
        </div>
      </section>

      {/* COMPANY OVERVIEW */}
      <section className="py-7">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <motion.div 
                className="position-relative rounded-4 overflow-hidden shadow-lg"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <img
                  src="/images/tentang kami.jpg"
                  alt="Showroom Kami"
                  className="img-fluid w-100"
                  style={{ height: "500px", objectFit: "cover" }}
                />
                <div className="position-absolute bottom-0 start-0 p-4 bg-dark bg-opacity-75 text-white w-100">
                  <h3 className="h4 mb-0">Rental Mobil Terbai di Sukoharjo</h3>
                </div>
              </motion.div>
            </div>
            
            <div className="col-lg-6 ps-lg-5">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <span className="badge bg-primary bg-opacity-10 text-primary fs-6 mb-3">Tentang Kami</span>
                <h2 className="display-5 fw-bold mb-4">Perjalanan <span className="text-gradient-blue">Rental Mobil HS</span></h2>
                <p className="lead text-muted mb-4">
                  Sejak tahun 2000, Rental Mobil HS telah menjadi pilihan utama untuk solusi transportasi premium di Jawa Tengah. Kami memulai dengan 3 armada dan kini telah berkembang menjadi salah satu penyedia jasa rental mobil terkemuka di wilayah ini.
                </p>
                
                <div className="row g-3">
                  {[
                    { icon: <FaRoad className="fs-3" />, value: "23+", label: "Tahun Pengalaman" },
                    { icon: <FaCar className="fs-3" />, value: "500+", label: "Armada" },
                    { icon: <FaUsers className="fs-3" />, value: "15.000+", label: "Pelanggan" },
                    { icon: <FaChartLine className="fs-3" />, value: "98%", label: "Kepuasan" }
                  ].map((item, index) => (
                    <div className="col-6" key={index}>
                      <motion.div
                        className="bg-light p-4 rounded-4 h-100"
                        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.05)" }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <div className="text-primary mb-2">{item.icon}</div>
                        <h3 className="fw-bold mb-1">{item.value}</h3>
                        <p className="text-muted mb-0">{item.label}</p>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="py-7 bg-light">
        <div className="container">
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="badge bg-primary bg-opacity-10 text-primary fs-6 mb-3">Keunggulan Kami</span>
              <h2 className="display-5 fw-bold mb-3">Mengapa Memilih <span className="text-gradient-blue">Kami?</span></h2>
              <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
                Kami memberikan pengalaman rental mobil yang berbeda dengan fokus pada kualitas, keamanan, dan kenyamanan
              </p>
            </motion.div>
          </div>
          
          <div className="row g-4">
            {[
              { 
                icon: <FaShieldAlt className="fs-3" />,
                title: "Keamanan Terjamin",
                desc: "Semua armada melalui pemeriksaan rutin 150 poin dan dilengkapi asuransi komprehensif",
                color: "primary"
              },
              { 
                icon: <FaUserTie className="fs-3" />,
                title: "Supir Profesional",
                desc: "Supir berpengalaman dengan pengetahuan rute yang luas dan layanan ramah",
                color: "success"
              },
              { 
                icon: <FaClock className="fs-3" />,
                title: "Tepat Waktu",
                desc: "Komitmen ketepatan waktu dengan garansi pengantaran sesuai jadwal",
                color: "warning"
              },
              { 
                icon: <FaTag className="fs-3" />,
                title: "Harga Transparan",
                desc: "Tidak ada biaya tersembunyi dengan harga kompetitif dan paket lengkap",
                color: "info"
              },
              { 
                icon: <FaHeadset className="fs-3" />,
                title: "Dukungan 24/7",
                desc: "Tim layanan pelanggan siap membantu kapan saja selama perjalanan Anda",
                color: "danger"
              },
              { 
                icon: <FaAward className="fs-3" />,
                title: "Reputasi Terbukti",
                desc: "Penghargaan Best Car Rental 2023 dengan rating 4.9/5 dari pelanggan",
                color: "purple"
              }
            ].map((item, index) => (
              <div className="col-md-6 col-lg-4" key={index}>
                <motion.div 
                  className="h-100 p-5 bg-white rounded-4 shadow-sm"
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`icon-lg bg-${item.color}-soft text-${item.color} rounded-3 mb-4`}>
                    {item.icon}
                  </div>
                  <h3 className="h4 fw-bold mb-3">{item.title}</h3>
                  <p className="text-muted mb-0">{item.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-7 position-relative bg-white">
        <div className="container">
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="badge bg-primary bg-opacity-10 text-primary fs-6 mb-3">Sejarah Kami</span>
              <h2 className="display-5 fw-bold mb-3">Perjalanan <span className="text-gradient-blue">Kami</span></h2>
              <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
                Jejak langkah Rental Mobil HS dari awal berdiri hingga menjadi pilihan utama
              </p>
            </motion.div>
          </div>
          
          <div className="timeline-wrapper">
            <div className="timeline-line"></div>
            {[
              { 
                year: "2000", 
                title: "Pendirian", 
                desc: "Rental Mobil HS didirikan dengan 3 armada pertama di Sukoharjo",
                icon: <FaRegHandshake />
              },
              { 
                year: "2005", 
                title: "Ekspansi Armada", 
                desc: "Menambah armada menjadi 20 unit dan mulai melayani perusahaan",
                icon: <FaCar />
              },
              { 
                year: "2012", 
                title: "Digitalisasi", 
                desc: "Meluncurkan sistem pemesanan online dan ekspansi ke 5 kota",
                icon: <FaChartLine />
              },
              { 
                year: "2018", 
                title: "Penghargaan", 
                desc: "Mendapat penghargaan Best Car Rental Jawa Tengah",
                icon: <FaAward />
              },
              { 
                year: "2023", 
                title: "Pencapaian", 
                desc: "500+ armada dan menjadi salah satu rental terbesar di Jawa Tengah",
                icon: <FaThumbsUp />
              }
            ].map((item, index) => (
              <motion.div 
                className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="timeline-icon">
                  {item.icon}
                </div>
                <div className="timeline-content">
                  <div className="timeline-year">{item.year}</div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-7 bg-light">
        <div className="container">
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="badge bg-primary bg-opacity-10 text-primary fs-6 mb-3">Testimoni</span>
              <h2 className="display-5 fw-bold mb-3">Apa Kata <span className="text-gradient-blue">Pelanggan?</span></h2>
              <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
                Berikut pengalaman nyata dari pelanggan yang telah menggunakan layanan kami
              </p>
            </motion.div>
          </div>
          
          <div className="row g-4">
            {[
              {
                name: "Muhammad Rizky Falih",
                role: "Business Traveler",
                quote: "Pelayanan sangat profesional, mobil selalu dalam kondisi prima. Sudah 5 tahun menggunakan jasa Rental Mobil HS untuk kebutuhan bisnis.",
                rating: 5,
                image: "/images/iki.jpg"
              },
              {
                name: "Akhmal Ramadhan",
                role: "Family Vacation",
                quote: "Supirnya sangat ramah dan sabar, mobil nyaman untuk perjalanan keluarga. Harga juga sangat kompetitif untuk kualitas yang diberikan.",
                rating: 5,
                image: "/images/male.jpg"
              },
              {
                name: "Aji Candra Saputra",
                role: "Corporate Client",
                quote: "Kami menggunakan layanan mereka untuk kebutuhan transportasi tamu perusahaan. Selalu tepat waktu dan memberikan kesan profesional.",
                rating: 4,
                image: "/images/aji.jpg"
              }
            ].map((testimonial, index) => (
              <div className="col-lg-4" key={index}>
                <motion.div 
                  className="h-100 p-4 bg-white rounded-4 shadow-sm"
                  whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="d-flex align-items-center mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="testimonial-photo me-3"
                    />
                    <div>
                      <h5 className="fw-bold mb-1">{testimonial.name}</h5>
                      <p className="text-muted mb-0 small">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="mb-4">"{testimonial.quote}"</p>
                  <div className="text-warning">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="me-1" />
                    ))}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-7 bg-primary text-white position-relative overflow-hidden">
        <div className="cta-overlay"></div>
        <div className="container position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <motion.h2 
                className="display-5 fw-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                Siap Memulai Perjalanan Anda?
              </motion.h2>
              <motion.p 
                className="lead mb-5 opacity-75"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                Hubungi kami sekarang untuk mendapatkan penawaran terbaik atau kunjungi showroom kami di Sukoharjo
              </motion.p>
              <motion.div 
                className="d-flex flex-wrap justify-content-center gap-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <motion.button 
                  className="btn btn-light btn-lg rounded-pill px-4 py-3 text-primary fw-bold"
                  onClick={() => navigate("/layanan")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCar className="me-2" />Lihat Armada
                </motion.button>
                <motion.button 
                  className="btn btn-outline-light btn-lg rounded-pill px-4 py-3 border-2"
                  onClick={() => document.getElementById('contact-section').scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPhoneAlt className="me-2" />Hubungi Kami
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact-section" className="py-7 bg-white">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5 mb-5 mb-lg-0">
              <motion.div 
                className="h-100 p-4 p-lg-5 bg-light rounded-4 shadow-sm"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="display-6 fw-bold mb-4">Informasi <span className="text-gradient-blue">Kontak</span></h2>
                <p className="text-muted mb-5">
                  Kami siap membantu Anda 24 jam melalui berbagai saluran komunikasi berikut:
                </p>
                
                <div className="d-flex flex-column gap-4">
                  {/* Alamat */}
                  <div className="d-flex align-items-start gap-3">
                    <div className="icon-md bg-primary-soft text-primary rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center">
                      <FaMapMarkerAlt className="fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Alamat Kantor</h5>
                      <p className="text-muted mb-0">
                        Jl. Watugajah Jl. Widyapura No.7, Dusun I, Singopuran, Kec. Kartasura, Kabupaten Sukoharjo, Jawa Tengah 57164
                      </p>
                    </div>
                  </div>
                  {/* Telepon */}
                  <div className="d-flex align-items-start gap-3">
                    <div className="icon-md bg-success-soft text-success rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center">
                      <FaPhoneAlt className="fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Telepon/WhatsApp</h5>
                      <p className="text-muted mb-0">08170455544</p>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-start gap-3">
                    <div className="icon-md bg-warning-soft text-warning rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center">
                      <FaEnvelope className="fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Email</h5>
                      <p className="text-muted mb-0">rentalhs591@gmail.com</p>
                    </div>
                  </div>
                  {/* Social Media */}
                  <div className="d-flex align-items-start gap-3">
                    <div className="icon-md bg-info-soft text-info rounded-3 flex-shrink-0 d-flex align-items-center justify-content-center">
                      <FaUsers className="fs-4" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-2">Social Media</h5>
                      <div className="d-flex gap-3 mt-1">
                        <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="social-icon text-primary fs-4">
                          <FaFacebook />
                        </a>
                        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="social-icon text-danger fs-4">
                          <FaInstagram />
                        </a>
                        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="social-icon text-info fs-4">
                          <FaTwitter />
                        </a>
                        <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="social-icon text-primary fs-4">
                          <FaLinkedin />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-lg-7">
              <motion.div 
                className="h-100 p-4 p-lg-5 bg-white rounded-4 shadow-lg"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="display-6 fw-bold mb-4">Kirim <span className="text-gradient-blue">Pesan</span></h2>
                <p className="text-muted mb-5">
                  Isi formulir berikut dan kami akan segera merespons pertanyaan Anda
                </p>
                
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          placeholder="Nama Anda"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          required
                        />
                        <label htmlFor="name">Nama Lengkap</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          placeholder="Email Anda"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          required
                        />
                        <label htmlFor="email">Alamat Email</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        placeholder="Subjek"
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        required
                      />
                      <label htmlFor="subject">Subjek Pesan</label>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="form-floating">
                      <textarea
                        className="form-control"
                        id="message"
                        placeholder="Pesan Anda"
                        style={{ height: "150px" }}
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        required
                      ></textarea>
                      <label htmlFor="message">Pesan Anda</label>
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 py-3 rounded-pill fw-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaPaperPlane className="me-2" />Kirim Pesan
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;