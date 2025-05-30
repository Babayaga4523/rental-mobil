import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../style/About.css";

const About = () => {
  const navigate = useNavigate();

  const [form, setForm] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
      easing: 'ease-in-out-quad'
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const phone = "6281294743876";
    const text = `Halo Admin Rental Mobil HS!%0A%0A` +
      `Nama: ${form.name}%0A` +
      `Email: ${form.email}%0A` +
      `Subjek: ${form.subject}%0A` +
      `Pesan: ${form.message}`;
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="about-page"
    >
      {/* HERO SECTION: gunakan prefix about- pada semua class */}
      <section className="about-hero-section position-relative overflow-hidden">
        <div className="about-hero-gradient-overlay"></div>
        <div className="about-hero-bg-parallax"></div>
        <div className="container h-100 position-relative z-2">
          <div className="row h-100 align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <div className="about-hero-tagline mb-3" data-aos="fade-down">
                <span className="badge bg-white text-primary fs-6 px-4 py-2 shadow-lg border border-2 border-primary">
                  <i className="fas fa-star me-2"></i>
                  <span className="fw-bold">Premium Car Rental</span>
                </span>
              </div>
              <h1 className="about-hero-title display-2 fw-bold mb-3 text-gradient-primary" data-aos="fade-up" style={{ letterSpacing: 1 }}>
                Tentang <span className="text-gradient-primary">Kami</span>
              </h1>
              <p className="about-hero-subtitle lead text-light opacity-85 mb-4" data-aos="fade-up" data-aos-delay="100">
                Menyediakan solusi transportasi <b>premium</b> sejak 2000<br className="d-none d-lg-block" />
                dengan komitmen pada kualitas & kepuasan pelanggan
              </p>
              <div className="about-hero-cta d-flex justify-content-center gap-3" data-aos="fade-up" data-aos-delay="200">
                <button 
                  className="btn btn-primary btn-lg rounded-pill px-4 py-3 shadow"
                  onClick={() => navigate("/layanan")}
                >
                  <i className="fas fa-car me-2"></i>Lihat Armada
                </button>
                <button 
                  className="btn btn-outline-light btn-lg rounded-pill px-4 py-3"
                  onClick={() => document.getElementById('contact-section').scrollIntoView({ behavior: 'smooth' })}
                >
                  <i className="fas fa-phone me-2"></i>Hubungi Kami
                </button>
              </div>
            </div>
          </div> {/* penutup .row */}
        </div> {/* penutup .container */}
      </section>

      {/* Mission Section with Icon Cards */}
      <section className="mission-section py-7 position-relative">
        <div className="container position-relative">
          <div className="section-header text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title display-5 fw-bold mb-3">
                <span className="text-gradient-primary">Misi Kami</span>
              </h2>
              <p className="section-subtitle lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
                Memberikan pengalaman terbaik dalam setiap perjalanan Anda dengan standar layanan tertinggi
              </p>
            </motion.div>
          </div>
          
          <div className="row g-4 justify-content-center">
            {[
              { 
                icon: "fa-thumbs-up", 
                title: "Kualitas Terbaik", 
                desc: "Armada terawat dengan standar tinggi dan fasilitas lengkap untuk kenyamanan maksimal Anda.",
                color: "primary",
                delay: 0
              },
              { 
                icon: "fa-hand-holding-heart", 
                title: "Pelayanan Prima", 
                desc: "Tim profesional kami siap memberikan pelayanan terbaik 24/7 untuk semua kebutuhan transportasi Anda.",
                color: "success",
                delay: 100
              },
              { 
                icon: "fa-shield-alt", 
                title: "Keamanan Utama", 
                desc: "Prioritas keselamatan dengan armada yang melalui pemeriksaan rutin dan sistem keamanan terkini.",
                color: "warning",
                delay: 200
              }
            ].map((mission, index) => (
              <div className="col-md-4" key={index} data-aos="fade-up" data-aos-delay={mission.delay}>
                <motion.div 
                  whileHover={{ y: -10, boxShadow: `0 15px 30px rgba(var(--bs-${mission.color}-rgb), 0.1)` }}
                  className="mission-card h-100 border-0 rounded-4 overflow-hidden shadow-sm bg-white"
                >
                  <div className="card-body p-5 text-center">
                    <div className={`mission-icon bg-gradient-${mission.color} mb-4 mx-auto`}>
                      <i className={`fas ${mission.icon} text-white fs-3`}></i>
                    </div>
                    <h3 className="h4 fw-bold mb-3">{mission.title}</h3>
                    <p className="text-muted">{mission.desc}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Content Section */}
      <section className="about-content py-7 bg-light position-relative">
        <div className="container">
          <div className="section-header text-center mb-6" data-aos="fade-up">
            <h2 className="section-title display-5 fw-bold mb-3">
              <span className="text-gradient-primary">Keunggulan Kami</span>
            </h2>
            <p className="section-subtitle lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
              Sebagai penyedia jasa sewa mobil terkemuka, kami bangga menawarkan pengalaman berkendara premium
            </p>
          </div>

          {/* About Image and Features */}
          <div className="row align-items-center mb-6">
            {/* Image Section */}
            <div className="col-lg-6 mb-5 mb-lg-0" data-aos="fade-right">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="about-image position-relative rounded-4 overflow-hidden shadow-lg border border-4 border-white"
              >
                <img
                  src="/images/tentang kami 1.jpg"
                  alt="Showroom Kami"
                  className="img-fluid w-100 hover-zoom"
                  style={{ minHeight: "500px", objectFit: "cover" }}
                />
                <div 
                  className="experience-badge bg-primary text-white shadow-lg"
                  data-aos="zoom-in"
                  data-aos-delay="500"
                >
                  <div className="experience-years display-3 fw-bold">23+</div>
                  <div className="experience-text text-uppercase fs-6">Tahun Pengalaman</div>
                </div>
              </motion.div>
            </div>

            {/* Features Section */}
            <div className="col-lg-6" data-aos="fade-left">
              <div className="ps-lg-5">
                <h3 className="h2 fw-bold mb-4 position-relative">
                  <span className="text-gradient-primary">Mengapa</span> Memilih Kami?
                  <span className="title-underline"></span>
                </h3>
                <div className="alert alert-info d-flex align-items-center mb-4" role="alert" style={{ fontSize: "1.05rem" }}>
                  <i className="fas fa-user-tie me-2 fs-5 text-primary"></i>
                  <span>
                    <b>Semua layanan rental sudah termasuk supir profesional.</b> <br className="d-none d-md-block" />
                    <span className="text-danger fw-semibold">Tidak melayani lepas kunci (self-drive).</span>
                  </span>
                </div>
                
                <div className="row g-4">
                  {[
                    { 
                      icon: "fa-car", 
                      title: "500+ Armada Berkualitas", 
                      desc: "Pilihan mobil terbaru dari merek ternama",
                      color: "danger"
                    },
                    { 
                      icon: "fa-clock", 
                      title: "Layanan 24/7", 
                      desc: "Dukungan pelanggan setiap saat",
                      color: "info"
                    },
                    { 
                      icon: "fa-tag", 
                      title: "Harga Kompetitif", 
                      desc: "Tanpa biaya tersembunyi",
                      color: "success"
                    },
                    { 
                      icon: "fa-shield-alt", 
                      title: "Asuransi Lengkap", 
                      desc: "Perlindungan maksimal untuk Anda",
                      color: "warning"
                    },
                    { 
                      icon: "fa-map-marker-alt", 
                      title: "Jaringan Luas", 
                      desc: "Tersedia di 15 kota besar",
                      color: "primary"
                    },
                    { 
                      icon: "fa-award", 
                      title: "Penghargaan", 
                      desc: "Best Car Rental 2023",
                      color: "purple"
                    }
                  ].map((feature, index) => (
                    <div 
                      key={index} 
                      className="col-md-6"
                      data-aos="fade-up"
                      data-aos-delay={100 * (index % 2 + 1)}
                    >
                      <motion.div
                        whileHover={{ y: -5, boxShadow: `0 10px 20px rgba(var(--bs-${feature.color}-rgb), 0.1)` }}
                        className="feature-card h-100 p-4 rounded-4 bg-white shadow-sm"
                      >
                        <div className={`feature-icon rounded-circle bg-soft-${feature.color} text-${feature.color} mb-3`}>
                          <i className={`fas ${feature.icon} fs-4`}></i>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-2">{feature.title}</h5>
                          <p className="text-muted mb-0">{feature.desc}</p>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Commitment Section */}
          <div className="row align-items-center mt-6 pt-5">
            {/* Image Section */}
            <div className="col-lg-6 order-lg-2 mb-5 mb-lg-0" data-aos="fade-left">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="about-image position-relative rounded-4 overflow-hidden shadow-lg border border-4 border-white"
              >
                <img
                  src="/images/tentang kami.jpg"
                  alt="Pelayanan Kami"
                  className="img-fluid w-100"
                  style={{ minHeight: "500px", objectFit: "cover" }}
                />
                <div 
                  className="customer-badge bg-success text-white shadow-lg"
                  data-aos="zoom-in"
                  data-aos-delay="500"
                >
                  <div className="customer-count display-3 fw-bold">98%</div>
                  <div className="customer-text text-uppercase fs-6">Kepuasan Pelanggan</div>
                </div>
              </motion.div>
            </div>

            {/* Commitment Text Section */}
            <div className="col-lg-6 order-lg-1" data-aos="fade-right">
              <div className="pe-lg-5">
                <h2 className="display-6 fw-bold mb-4">
                  <span className="text-gradient-primary">Komitmen Kami</span>
                </h2>
                <p className="lead mb-5">
                  Kami tidak hanya menyewakan mobil, tetapi memberikan pengalaman perjalanan yang istimewa dengan standar layanan premium.
                </p>
                
                {/* Commitment Points */}
                <div className="commitment-points">
                  {[
                    { 
                      icon: "fa-shield-alt", 
                      color: "primary", 
                      title: "Keamanan Utama", 
                      desc: "Armada melalui pemeriksaan rutin 150 poin",
                      delay: 0
                    },
                    { 
                      icon: "fa-smile", 
                      color: "success", 
                      title: "Kepuasan Pelanggan", 
                      desc: "Rating 4.9/5 dari pelanggan",
                      delay: 100
                    },
                    { 
                      icon: "fa-clock", 
                      color: "warning", 
                      title: "Tepat Waktu", 
                      desc: "Garansi pengantaran sesuai jadwal",
                      delay: 200
                    },
                    { 
                      icon: "fa-headset", 
                      color: "info", 
                      title: "Dukungan Penuh", 
                      desc: "Asisten perjalanan 24 jam",
                      delay: 300
                    }
                  ].map((item, index) => (
                    <motion.div 
                      key={index} 
                      className="commitment-item d-flex mb-4 bg-white p-4 rounded-4 shadow-sm"
                      data-aos="fade-up"
                      data-aos-delay={item.delay}
                      whileHover={{ x: 5 }}
                    >
                      <div className={`commitment-icon bg-${item.color} bg-opacity-10 text-${item.color} rounded-3 p-3 me-4`}>
                        <i className={`fas ${item.icon} fs-4`}></i>
                      </div>
                      <div>
                        <h5 className="fw-bold mb-1">{item.title}</h5>
                        <p className="text-muted mb-0">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="about-timeline-section py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-gradient-primary mb-2">Perjalanan Kami</h2>
            <p className="lead text-muted">Sejarah singkat perkembangan Rental Mobil HS</p>
          </div>
          <div className="position-relative" style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Garis tengah */}
            <div
              className="position-absolute top-0 bottom-0 start-50 translate-middle-x bg-primary"
              style={{ width: 6, borderRadius: 3, opacity: 0.13, zIndex: 0 }}
            ></div>
            {[
              { year: 2000, title: "Didirikan", desc: "Rental Mobil HS berdiri dengan 3 armada pertama." },
              { year: 2005, title: "Ekspansi Armada", desc: "Armada bertambah menjadi 20 unit, mulai melayani perusahaan." },
              { year: 2012, title: "Digitalisasi", desc: "Mulai menerima pemesanan online dan memperluas layanan ke 5 kota." },
              { year: 2018, title: "Penghargaan Nasional", desc: "Mendapat penghargaan Best Car Rental Jawa Tengah." },
              { year: 2023, title: "500+ Armada", desc: "Menjadi salah satu rental terbesar di Jawa Tengah." }
            ].map((item, idx) => (
              <div
                className="row g-0 align-items-center mb-5 position-relative"
                key={idx}
              >
                {/* Kiri (event) */}
                <div
                  className={`col-12 col-md-5 d-flex ${idx % 2 === 0 ? "justify-content-end" : "order-md-2 justify-content-start"}`}
                >
                  <div
                    className={`timeline-content bg-light rounded-4 shadow-sm p-4 mb-3 mb-md-0`}
                    style={{
                      minWidth: 220,
                      maxWidth: 320,
                      borderLeft: idx % 2 === 0 ? "6px solid #0d6efd" : undefined,
                      borderRight: idx % 2 !== 0 ? "6px solid #0d6efd" : undefined,
                      animation: "fadeIn 0.7s",
                    }}
                  >
                    <h5 className="mb-1 fw-semibold">{item.title}</h5>
                    <p className="mb-0 text-muted">{item.desc}</p>
                  </div>
                </div>
                {/* Titik tahun di tengah garis */}
                <div className="col-12 col-md-2 d-flex justify-content-center align-items-center position-relative" style={{ zIndex: 2 }}>
                  <div
                    className="timeline-dot bg-primary text-white fw-bold rounded-circle shadow d-flex align-items-center justify-content-center border border-4 border-white"
                    style={{
                      width: 64,
                      height: 64,
                      fontSize: 22,
                      boxShadow: "0 4px 24px rgba(13,110,253,0.10)",
                      transition: "transform 0.2s",
                    }}
                  >
                    {item.year}
                  </div>
                </div>
                {/* Kanan (kosong untuk alternating) */}
                <div className={`col-12 col-md-5 ${idx % 2 === 0 ? "" : "order-md-1"}`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-section" className="contact-section py-7 bg-white">
        <div className="container">
          <div className="section-header text-center mb-6" data-aos="fade-up">
            <h2 className="section-title display-5 fw-bold mb-3">
              <span className="text-gradient-primary">Hubungi Kami</span>
            </h2>
            <p className="section-subtitle lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
              Kami siap membantu dan menjawab semua pertanyaan Anda
            </p>
          </div>
          
          <div className="row g-5">
            <div className="col-lg-5 mb-5 mb-lg-0">
              <motion.div 
                whileHover={{ y: -5 }}
                className="contact-info-card bg-light rounded-4 p-4 p-lg-5 h-100 shadow"
                data-aos="fade-right"
              >
                <h3 className="h4 fw-bold mb-4">Informasi Kontak</h3>
                
                {[
                  {
                    icon: "map-marker-alt",
                    color: "primary",
                    title: "Lokasi Kantor",
                    content: "l. Watugajah Jl. Widyapura No.7, Dusun I, Singopuran, Kec. Kartasura, Kabupaten Sukoharjo<br />Jawa Tengah 57164"
                  },
                  {
                    icon: "phone-alt",
                    color: "success",
                    title: "Telepon",
                    content: "08170455544"
                  },
                  {
                    icon: "envelope",
                    color: "warning",
                    title: "Email",
                    content: "rentalhs591@gmail.com"
                  }
                ].map((item, index) => (
                  <div className="contact-item d-flex mb-4" key={index}>
                    <div className={`contact-icon bg-${item.color} bg-opacity-10 text-${item.color} rounded-3 p-3 me-4`}>
                      <i className={`fas fa-${item.icon} fs-4`}></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-1">{item.title}</h5>
                      <p className="text-muted mb-0" dangerouslySetInnerHTML={{ __html: item.content }}></p>
                    </div>
                  </div>
                ))}
                
                <div className="social-links mt-5 pt-3">
                  <h5 className="fw-bold mb-3">Ikuti Kami</h5>
                  <div className="d-flex gap-3">
                    {['facebook', 'instagram', 'twitter', 'linkedin'].map((social, index) => (
                      <motion.a 
                        key={social} 
                        href="#" 
                        className={`social-icon bg-primary bg-opacity-10 text-primary rounded-3 p-3`}
                        whileHover={{ y: -3, backgroundColor: `rgba(var(--bs-primary-rgb), 0.2)` }}
                        data-aos="zoom-in"
                        data-aos-delay={index * 100}
                      >
                        <i className={`fab fa-${social} fs-4`}></i>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="col-lg-7">
              <motion.div 
                whileHover={{ y: -5 }}
                className="contact-form-card bg-grey rounded-4 p-4 p-lg-5 shadow-lg"
                data-aos="fade-left"
              >
                <h3 className="h4 fw-bold mb-4">Kirim Pesan</h3>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-4">
                    <div className="col-md-6" data-aos="fade-up" data-aos-delay="0">
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
                    <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
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
                  <div className="mb-4" data-aos="fade-up" data-aos-delay="200">
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
                  <div className="mb-4" data-aos="fade-up" data-aos-delay="300">
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
                    className="btn btn-primary btn-lg w-100 py-3 rounded-pill shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-aos="zoom-in"
                    data-aos-delay="400"
                  >
                    <i className="fas fa-paper-plane me-2"></i>Kirim Pesan
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