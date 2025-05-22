import React, { useState, useEffect } from "react";
import { Container, Row, Col, Badge, Modal, Button, Tab, Nav, Carousel, Accordion } from "react-bootstrap";
import {
  FaCameraRetro, FaTag, FaTimes, FaMapMarkerAlt, FaSmile, FaBuilding, FaCar, FaUsers, FaHandshake, FaAward, FaRoute, FaStar, FaRegCalendarCheck, FaRegClock, FaPlay, FaCheckCircle, FaQuestionCircle, FaPhoneAlt
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "../style/GalleryPage.css";

// --- DATA ---
const galleryData = [
  {
    title: "Kantor Rental Mobil HS",
    image: "/images/gallery/kantor-hs.jpg",
    category: "Kantor",
    desc: "Tampak depan kantor pusat Rental Mobil HS, pusat layanan dan administrasi yang selalu siap membantu kebutuhan transportasi Anda.",
    story: "Kantor kami menjadi pusat koordinasi seluruh layanan, memastikan setiap pelanggan mendapat pengalaman terbaik dari awal hingga akhir."
  },
  {
    title: "Tim Driver Profesional",
    image: "/images/gallery/driver-hs.jpg",
    category: "Driver",
    desc: "Driver HS yang ramah, berpengalaman, dan selalu siap mengantar Anda dengan aman dan nyaman ke tujuan.",
    story: "Setiap driver kami telah melalui pelatihan intensif dan memiliki pengalaman bertahun-tahun di bidang transportasi."
  },
  {
    title: "Pelanggan Bahagia",
    image: "/images/gallery/pelanggan-hs.jpg",
    category: "Pelanggan",
    desc: "Kepuasan pelanggan adalah prioritas kami. Terima kasih atas kepercayaan dan loyalitas Anda selama ini.",
  },
  {
    title: "Armada Siap Berangkat",
    image: "/images/gallery/armada-hs.jpg",
    category: "Armada",
    desc: "Armada HS selalu bersih, terawat, dan siap digunakan kapan saja untuk berbagai kebutuhan perjalanan.",
  },
  {
    title: "Event Perusahaan",
    image: "/images/gallery/event-hs.jpg",
    category: "Event",
    desc: "Rental Mobil HS dipercaya untuk mendukung berbagai event, gathering, dan kegiatan perusahaan besar.",
  },
  {
    title: "Serah Terima Mobil",
    image: "/images/gallery/serah-terima-hs.jpg",
    category: "Layanan",
    desc: "Proses serah terima mobil yang mudah, cepat, dan transparan untuk kenyamanan pelanggan.",
  },
  {
    title: "Testimoni Pelanggan",
    image: "/images/gallery/testimoni-hs.jpg",
    category: "Testimoni",
    desc: "Banyak pelanggan puas yang telah membagikan pengalaman positif bersama Rental Mobil HS.",
  },
  {
    title: "Perjalanan Wisata",
    image: "/images/gallery/wisata-hs.jpg",
    category: "Wisata",
    desc: "Rental Mobil HS menjadi partner perjalanan wisata keluarga, komunitas, dan perusahaan ke berbagai destinasi.",
  },
  {
    title: "Armada Premium",
    image: "/images/gallery/premium-hs.jpg",
    category: "Armada",
    desc: "Pilihan armada premium untuk kebutuhan eksekutif, bisnis, dan acara spesial Anda.",
  },
  {
    title: "Pelatihan Driver",
    image: "/images/gallery/pelatihan-driver-hs.jpg",
    category: "Driver",
    desc: "Pelatihan rutin untuk driver kami agar selalu memberikan pelayanan terbaik dan profesional.",
  },
  {
    title: "Layanan 24 Jam",
    image: "/images/gallery/layanan-24jam-hs.jpg",
    category: "Layanan",
    desc: "Kami siap melayani kebutuhan rental mobil Anda 24 jam penuh, setiap hari.",
  },
  {
    title: "Penghargaan & Apresiasi",
    image: "/images/gallery/apresiasi-hs.jpg",
    category: "Penghargaan",
    desc: "Rental Mobil HS menerima berbagai penghargaan atas dedikasi dan kualitas layanan.",
  },
  {
    title: "Kerjasama Instansi",
    image: "/images/gallery/kerjasama-hs.jpg",
    category: "Kerjasama",
    desc: "Bekerjasama dengan berbagai instansi, perusahaan, dan komunitas untuk solusi transportasi terbaik.",
  },
  {
    title: "Rombongan Perjalanan",
    image: "/images/gallery/rombongan-hs.jpg",
    category: "Pelanggan",
    desc: "Layanan untuk rombongan, komunitas, dan group dengan armada besar dan fasilitas lengkap.",
  },
  {
    title: "Mobil Bersih & Disinfeksi",
    image: "/images/gallery/disinfeksi-hs.jpg",
    category: "Armada",
    desc: "Setiap armada selalu dibersihkan dan didisinfeksi sebelum dan sesudah digunakan.",
  },
  {
    title: "Booking Online Mudah",
    image: "/images/gallery/booking-hs.jpg",
    category: "Layanan",
    desc: "Nikmati kemudahan booking mobil secara online, cepat, dan praktis dari mana saja.",
  },
  // Tambahkan lebih banyak foto aktivitas, penghargaan, event, dsb sesuai dokumentasi HS
];

const categories = [
  "Semua",
  ...Array.from(new Set(galleryData.map(item => item.category)))
];

const testimonials = [
  {
    name: "Budi Santoso",
    image: "/images/gallery/testi1.jpg",
    comment: "Pelayanan sangat memuaskan, mobil bersih dan tepat waktu. Recommended!",
    rating: 5
  },
  {
    name: "Siti Aminah",
    image: "/images/gallery/testi2.jpg",
    comment: "Sopir ramah, perjalanan nyaman. Harga juga bersaing.",
    rating: 4.8
  },
  {
    name: "Andi Wijaya",
    image: "/images/gallery/testi3.jpg",
    comment: "Booking mudah, armada banyak pilihan, dan CS responsif.",
    rating: 5
  }
];

const faqs = [
  {
    q: "Bagaimana cara booking mobil di Rental Mobil HS?",
    a: "Anda bisa booking langsung melalui website, WhatsApp, atau datang ke kantor kami."
  },
  {
    q: "Apakah bisa sewa mobil dengan supir?",
    a: "Tentu, kami menyediakan layanan sewa mobil dengan atau tanpa supir sesuai kebutuhan Anda."
  },
  {
    q: "Bagaimana keamanan dan kebersihan armada?",
    a: "Setiap armada selalu dicek, dibersihkan, dan didisinfeksi sebelum dan sesudah digunakan."
  },
  {
    q: "Apakah tersedia layanan antar-jemput?",
    a: "Ya, kami melayani antar-jemput area Jabodetabek dan sekitarnya."
  }
];

const partners = [
  { name: "PT. Astra", logo: "/images/partners/astra.png" },
  { name: "Bank Mandiri", logo: "/images/partners/mandiri.png" },
  { name: "Pertamina", logo: "/images/partners/pertamina.png" },
  { name: "Telkom Indonesia", logo: "/images/partners/telkom.png" }
];

const certificates = [
  { title: "ISO 9001:2015", image: "/images/certificates/iso9001.jpg" },
  { title: "Top Rental Award", image: "/images/certificates/toprental.jpg" }
];

// --- ICONS ---
const categoryIcons = {
  "Kantor": <FaBuilding className="me-1" />,
  "Driver": <FaCar className="me-1" />,
  "Pelanggan": <FaSmile className="me-1" />,
  "Armada": <FaCar className="me-1" />,
  "Event": <FaMapMarkerAlt className="me-1" />,
  "Layanan": <FaTag className="me-1" />,
  "Testimoni": <FaStar className="me-1" />,
  "Wisata": <FaRoute className="me-1" />,
  "Penghargaan": <FaAward className="me-1" />,
  "Kerjasama": <FaHandshake className="me-1" />,
};

// --- COMPONENT ---
const Gallery = () => {
  const [showModal, setShowModal] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("Semua");

  useEffect(() => {
    AOS.init({ duration: 900, once: true, easing: "ease-in-out" });
  }, []);

  const handleShow = (img) => {
    setActiveImage(img);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setActiveImage(null);
  };

  // Filter gallery
  const filteredGallery = activeCategory === "Semua"
    ? galleryData
    : galleryData.filter(item => item.category === activeCategory);

  return (
    <div className="gallery-page-root bg-light min-vh-100">
      {/* HERO SECTION */}
      <section className="gallery-hero position-relative d-flex align-items-center justify-content-center">
        <div className="gallery-hero-overlay"></div>
        <Container className="position-relative z-index-2 text-center">
          <div
            className="hero-glass mx-auto mb-4"
            data-aos="zoom-in"
            data-aos-delay="100"
          >
            <FaCameraRetro className="me-2 text-gold" size={48} />
          </div>
          <h1
            className="display-4 fw-bold mb-3 hero-title"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            <span className="hero-gradient-text">
              Gallery Rental Mobil HS
            </span>
          </h1>
          <p
            className="lead mb-4 hero-lead"
            data-aos="fade-up"
            data-aos-delay="350"
          >
            Selamat datang di <b>Gallery Rental Mobil HS</b>!  
            <br />
            Temukan dokumentasi lengkap perjalanan kami: aktivitas harian, pelayanan pelanggan, armada, event perusahaan, penghargaan, hingga momen-momen spesial bersama pelanggan setia.
            <br className="d-none d-md-block" />
            <span className="d-inline-block mt-2">
              <FaRegCalendarCheck className="me-1" />
              <b>Lebih dari 10 tahun pengalaman</b> di dunia rental mobil, HS selalu berkomitmen memberikan layanan terbaik, armada terawat, dan pengalaman perjalanan yang tak terlupakan.
            </span>
          </p>
          <Row className="justify-content-center mt-4" data-aos="fade-up" data-aos-delay="500">
            <Col xs={6} md={3} className="mb-3">
              <div className="bg-white rounded-4 shadow-sm py-3 px-2 d-flex flex-column align-items-center hero-stat-glass">
                <FaUsers className="text-primary mb-2" size={32} />
                <div className="fw-bold fs-4 text-primary">10.000+</div>
                <div className="text-muted small">Pelanggan Puas</div>
              </div>
            </Col>
            <Col xs={6} md={3} className="mb-3">
              <div className="bg-white rounded-4 shadow-sm py-3 px-2 d-flex flex-column align-items-center hero-stat-glass">
                <FaCar className="text-warning mb-2" size={32} />
                <div className="fw-bold fs-4 text-warning">50+</div>
                <div className="text-muted small">Armada Aktif</div>
              </div>
            </Col>
            <Col xs={6} md={3} className="mb-3">
              <div className="bg-white rounded-4 shadow-sm py-3 px-2 d-flex flex-column align-items-center hero-stat-glass">
                <FaRegClock className="text-success mb-2" size={32} />
                <div className="fw-bold fs-4 text-success">24 Jam</div>
                <div className="text-muted small">Layanan Nonstop</div>
              </div>
            </Col>
            <Col xs={6} md={3} className="mb-3">
              <div className="bg-white rounded-4 shadow-sm py-3 px-2 d-flex flex-column align-items-center hero-stat-glass">
                <FaAward className="text-gold mb-2" size={32} />
                <div className="fw-bold fs-4 text-gold">Berkualitas</div>
                <div className="text-muted small">Penghargaan & Apresiasi</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* VIDEO SECTION */}
      <section className="py-5 bg-white">
        <Container>
          <h2 className="fw-bold text-center mb-4" data-aos="fade-up">
            <FaPlay className="me-2" />
            Video Dokumentasi & Profil
          </h2>
          <Row className="justify-content-center">
            <Col md={8} data-aos="zoom-in">
              <div className="ratio ratio-16x9 rounded-4 shadow-lg overflow-hidden">
                <iframe
                  src="https://www.youtube.com/embed/2u5A2eJt4DQ"
                  title="Profil Rental Mobil HS"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 0 }}
                ></iframe>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FILTER & GALLERY GRID */}
      <Container className="py-5">
        <div className="text-center mb-4" data-aos="fade-up">
          <h2 className="fw-bold mb-2 text-primary">Momen & Aktivitas Rental Mobil HS</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: 600 }}>
            Setiap foto di bawah ini adalah bukti nyata dedikasi kami dalam memberikan layanan rental mobil terbaik, mulai dari pelayanan pelanggan, perawatan armada, hingga berbagai event dan penghargaan yang telah kami raih.
          </p>
        </div>
        <div className="d-flex flex-wrap justify-content-center mb-4 gap-2" data-aos="fade-up" data-aos-delay="100">
          {categories.map((cat, idx) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "primary" : "outline-primary"}
              className="rounded-pill px-4"
              onClick={() => setActiveCategory(cat)}
              style={{ fontWeight: 600, letterSpacing: 0.5 }}
              data-aos="fade-right"
              data-aos-delay={idx * 60}
            >
              {cat}
            </Button>
          ))}
        </div>
        <Row className="g-4">
          {filteredGallery.map((item, idx) => (
            <Col
              md={4}
              sm={6}
              xs={12}
              key={idx}
              data-aos="zoom-in-up"
              data-aos-delay={idx * 80}
            >
              <div
                className="gallery-card shadow-sm rounded-4 overflow-hidden position-relative"
                onClick={() => handleShow(item)}
                style={{ cursor: "pointer", background: "#fff" }}
              >
                <div className="gallery-img-container position-relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="gallery-img w-100"
                    style={{
                      height: 220,
                      objectFit: "cover",
                      transition: "transform 0.3s"
                    }}
                  />
                  <Badge bg="primary" className="gallery-category-badge">
                    {categoryIcons[item.category] || <FaTag className="me-1" />}
                    {item.category}
                  </Badge>
                </div>
                <div className="p-3">
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted mb-0" style={{ minHeight: 48 }}>{item.desc}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* MODAL PREVIEW DENGAN CERITA */}
      <Modal show={showModal} onHide={handleClose} centered size="lg" contentClassName="gallery-modal-content">
        <Modal.Body className="p-0 position-relative">
          <Button
            variant="light"
            className="gallery-modal-close"
            onClick={handleClose}
            aria-label="Tutup"
          >
            <FaTimes />
          </Button>
          {activeImage && (
            <img
              src={activeImage.image}
              alt={activeImage.title}
              className="w-100 gallery-modal-img"
              style={{
                maxHeight: "70vh",
                objectFit: "contain",
                background: "#222",
                borderRadius: "1.5rem"
              }}
              data-aos="zoom-in"
            />
          )}
        </Modal.Body>
        {activeImage && (
          <Modal.Footer className="bg-white d-flex flex-column align-items-start">
            <h4 className="fw-bold mb-1">{activeImage.title}</h4>
            <div className="mb-2">
              <Badge bg="primary" className="me-2">
                {categoryIcons[activeImage.category] || <FaTag className="me-1" />}
                {activeImage.category}
              </Badge>
            </div>
            <p className="mb-1 text-muted">{activeImage.desc}</p>
            {activeImage.story && (
              <div className="bg-light rounded-3 p-3 mt-2 w-100">
                <strong>Cerita di balik foto:</strong>
                <br />
                <span className="text-secondary">{activeImage.story}</span>
              </div>
            )}
          </Modal.Footer>
        )}
      </Modal>

      {/* TESTIMONIAL SLIDER */}
      <section className="py-5 bg-white">
        <Container>
          <h2 className="fw-bold text-center mb-4" data-aos="fade-up">
            <FaStar className="me-2 text-warning" />
            Testimoni Pelanggan
          </h2>
          <Carousel indicators={false} controls={testimonials.length > 1} interval={5000}>
            {testimonials.map((t, i) => (
              <Carousel.Item key={i}>
                <div className="d-flex flex-column align-items-center justify-content-center py-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="rounded-circle mb-3"
                    style={{ width: 72, height: 72, objectFit: "cover", border: "3px solid #ffd700" }}
                  />
                  <h5 className="fw-bold mb-1">{t.name}</h5>
                  <div className="mb-2">
                    {[...Array(Math.floor(t.rating))].map((_, idx) => (
                      <FaStar key={idx} className="text-warning" />
                    ))}
                    {t.rating % 1 !== 0 && <FaStar className="text-warning" style={{ opacity: 0.5 }} />}
                  </div>
                  <p className="fst-italic text-muted text-center" style={{ maxWidth: 500 }}>
                    "{t.comment}"
                  </p>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </Container>
      </section>

      {/* SERTIFIKAT & PENGHARGAAN */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="fw-bold text-center mb-4" data-aos="fade-up">
            <FaAward className="me-2 text-gold" />
            Sertifikat & Penghargaan
          </h2>
          <Row className="justify-content-center">
            {certificates.map((c, i) => (
              <Col md={4} sm={6} xs={12} key={i} className="mb-4" data-aos="zoom-in" data-aos-delay={i * 100}>
                <div className="bg-white rounded-4 shadow-sm p-3 text-center">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="img-fluid mb-3"
                    style={{ maxHeight: 120, objectFit: "contain" }}
                  />
                  <h6 className="fw-bold">{c.title}</h6>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* PARTNER / SOCIAL PROOF */}
      <section className="py-5 bg-white">
        <Container>
          <h2 className="fw-bold text-center mb-4" data-aos="fade-up">
            <FaHandshake className="me-2 text-primary" />
            Partner & Klien Kami
          </h2>
          <Row className="justify-content-center align-items-center">
            {partners.map((p, i) => (
              <Col md={2} sm={3} xs={4} key={i} className="mb-4 text-center" data-aos="zoom-in" data-aos-delay={i * 80}>
                <img
                  src={p.logo}
                  alt={p.name}
                  className="img-fluid mb-2"
                  style={{ maxHeight: 60, objectFit: "contain", filter: "grayscale(0.3)" }}
                />
                <div className="small text-muted">{p.name}</div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* MAP SECTION */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="fw-bold text-center mb-4" data-aos="fade-up">
            <FaMapMarkerAlt className="me-2 text-danger" />
            Lokasi & Area Layanan
          </h2>
          <Row className="justify-content-center">
            <Col md={8} data-aos="zoom-in">
              <div className="ratio ratio-16x9 rounded-4 shadow-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.123456789!2d106.800000!3d-6.200000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f1c000000000%3A0x0000000000000000!2sRental+Mobil+HS!5e0!3m2!1sid!2sid!4v1680000000000!5m2!1sid!2sid"
                  title="Lokasi Rental Mobil HS"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="mt-3 text-center text-muted">
                <FaMapMarkerAlt className="me-1" />
                Jl. Contoh Raya No. 123, Jakarta Selatan, Indonesia
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* FAQ SECTION */}
      <section className="py-5 bg-white">
        <Container>
          <h2 className="fw-bold text-center mb-4" data-aos="fade-up">
            <FaQuestionCircle className="me-2 text-info" />
            FAQ Seputar Rental Mobil HS
          </h2>
          <Accordion defaultActiveKey="0" className="mx-auto" style={{ maxWidth: 700 }}>
            {faqs.map((f, i) => (
              <Accordion.Item eventKey={i.toString()} key={i} data-aos="fade-up" data-aos-delay={i * 80}>
                <Accordion.Header>{f.q}</Accordion.Header>
                <Accordion.Body>{f.a}</Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Container>
      </section>

      {/* CTA SECTION */}
      <section className="py-5 bg-gold text-center">
        <Container>
          <h2 className="fw-bold mb-3 text-white">
            <FaCheckCircle className="me-2" />
            Siap Berangkat? Booking Mobil Sekarang!
          </h2>
          <Button
            variant="light"
            size="lg"
            className="fw-bold px-5 py-3 rounded-pill"
            href="https://wa.me/6281381339149"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaPhoneAlt className="me-2" />
            Chat Admin & Booking
          </Button>
        </Container>
      </section>
    </div>
  );
};

export default Gallery;