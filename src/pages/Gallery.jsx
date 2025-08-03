import React, { useState, useEffect } from "react";
import { Container, Row, Col, Badge, Modal, Button, Tab, Nav, Carousel, Accordion, Form, Spinner } from "react-bootstrap";
import {
  FaCameraRetro, FaTag, FaTimes, FaMapMarkerAlt, FaSmile, FaBuilding, FaCar, FaUsers, FaHandshake, FaAward, FaRoute, FaStar, FaRegCalendarCheck, FaRegClock, FaPlay, FaCheckCircle, FaQuestionCircle, FaPhoneAlt, FaHeart, FaShareAlt, FaQuoteLeft, FaQuoteRight
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import "../style/GalleryPage.css";

// --- DATA ---
const galleryData = [
  {
    title: "Kantor Rental Mobil HS",
    image: "/images/kantor.jpg",
    category: "Kantor",
    desc: "Tampak depan kantor pusat Rental Mobil HS, pusat layanan dan administrasi yang selalu siap membantu kebutuhan transportasi Anda.",
    story: "Kantor kami menjadi pusat koordinasi seluruh layanan, memastikan setiap pelanggan mendapat pengalaman terbaik dari awal hingga akhir."
  },
  {
    title: "Tim Driver Profesional",
    image: "/images/tim.jpg",
    category: "Driver",
    desc: "Driver HS yang ramah, berpengalaman, dan selalu siap mengantar Anda dengan aman dan nyaman ke tujuan.",
    story: "Setiap driver kami telah melalui pelatihan intensif dan memiliki pengalaman bertahun-tahun di bidang transportasi."
  },
  {
    title: "Pelanggan Bahagia",
    image: "/images/pelanggan.jpg",
    category: "Pelanggan",
    desc: "Kepuasan pelanggan adalah prioritas kami. Terima kasih atas kepercayaan dan loyalitas Anda selama ini.",
  },
  {
    title: "Armada Siap Berangkat",
    image: "/images/armada premiunm.jpg",
    category: "Armada",
    desc: "Armada HS selalu bersih, terawat, dan siap digunakan kapan saja untuk berbagai kebutuhan perjalanan.",
  },
  {
    title: "Event Perusahaan",
    image: "/images/event perusahaan.jpg",
    category: "Event",
    desc: "Rental Mobil HS dipercaya untuk mendukung berbagai event, gathering, dan kegiatan perusahaan besar.",
  },
  {
    title: "Perjalanan Wisata",
    image: "/images/perjalanan wisata 1.jpg",
    category: "Wisata",
    desc: "Rental Mobil HS menjadi partner perjalanan wisata keluarga, komunitas, dan perusahaan ke berbagai destinasi.",
  },
  {
    title: "Armada Premium",
    image: "/images/armada.jpg",
    category: "Armada",
    desc: "Pilihan armada premium untuk kebutuhan eksekutif, bisnis, dan acara spesial Anda.",
  },
  {
    title: "Pelatihan Driver",
    image: "/images/pelatihan driver.jpg",
    category: "Driver",
    desc: "Pelatihan rutin untuk driver kami agar selalu memberikan pelayanan terbaik dan profesional.",
  },
  {
    title: "Rombongan Perjalanan",
    image: "/images/rombongan perjalanan.jpg",
    category: "Pelanggan",
    desc: "Layanan untuk rombongan, komunitas, dan group dengan armada besar dan fasilitas lengkap.",
  },
  {
    title: "Mobil Bersih & Disinfeksi",
    image: "/images/premium.jpg",
    category: "Armada",
    desc: "Setiap armada selalu dibersihkan dan didisinfeksi sebelum dan sesudah digunakan.",
  },
  {
    title: "Acara Pernikahan",
    image: "/images/wedding.jpg",
    category: "Layanan",
    desc: "Kami menyediakan layanan rental mobil untuk berbagai acara pernikahan, dengan pilihan kendaraan mewah dan pengemudi profesional untuk mendukung momen istimewa Anda.",
  },
  // Tambahkan lebih banyak foto aktivitas, penghargaan, event, dsb sesuai dokumentasi HS
];

const categories = [
  "Semua",
  ...Array.from(new Set(galleryData.map(item => item.category)))
];

const testimonials = [
  {
    name: "Akhmal Ramadhan",
    image: "/images/male.jpg",
    comment: "Pelayanan sangat memuaskan, mobil bersih dan tepat waktu. Recommended!",
    rating: 5
  },
  {
    name: "Aji Candra Saputra",
    image: "/images/aji.jpg",
    comment: "Sopir ramah, perjalanan nyaman. Harga juga bersaing.",
    rating: 4.8
  },
  {
    name: "Muhammad Rizky Falih",
    image: "/images/iki.jpg",
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



const certificates = [
  { title: "Top Rental Award", image: "/images/sertifikat.png" }
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

  // Tambahkan state baru
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState(categories[1] || "");
  const [uploadStory, setUploadStory] = useState("");
  const [uploading, setUploading] = useState(false);

  // Tambahkan state like
  const [likes, setLikes] = useState({}); // { [imageTitle]: jumlahLike }

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

  // Fungsi upload (dummy, sesuaikan dengan backend jika ada endpoint upload galeri)
  const handleUploadPhoto = async () => {
    if (!uploadFile || !uploadTitle) return;
    setUploading(true);
    // Simulasi upload, tambahkan ke galleryData lokal
    galleryData.unshift({
      title: uploadTitle,
      image: URL.createObjectURL(uploadFile),
      category: uploadCategory,
      desc: "Foto dari pelanggan",
      story: uploadStory
    });
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadTitle("");
    setUploadCategory(categories[1] || "");
    setUploadStory("");
    setUploading(false);
  };

  const handleLike = (title) => {
    setLikes(l => ({ ...l, [title]: (l[title] || 0) + 1 }));
  };

  const handleShare = (img) => {
    const url = window.location.href;
    const text = `Lihat foto "${img.title}" di Gallery Rental Mobil HS!`;
    if (navigator.share) {
      navigator.share({ title: img.title, text, url });
    } else {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    }
  };

  return (
    <div className="hs-gallery-page-root bg-light min-vh-100">
      {/* HERO SECTION */}
      <section className="hs-gallery-hero position-relative d-flex align-items-center justify-content-center">
        <div className="hs-gallery-hero-overlay"></div>
        <Container className="position-relative z-index-2 text-center">
          <div
            className="hs-hero-glass mx-auto mb-4"
            data-aos="zoom-in"
            data-aos-delay="100"
          >
            <FaCameraRetro className="me-2 text-gold" size={48} />
          </div>
          <h1
            className="display-4 fw-bold mb-3 hs-hero-title"
            data-aos="fade-down"
            data-aos-delay="200"
          >
            <span className="hs-hero-gradient-text">
              Gallery Rental Mobil HS
            </span>
          </h1>
          <p
            className="lead mb-4 hs-hero-lead"
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
              <div className="bg-white rounded-4 shadow-sm py-3 px-2 d-flex flex-column align-items-center hs-hero-stat-glass">
                <FaUsers className="text-primary mb-2" size={32} />
                <div className="fw-bold fs-4 text-primary">10.000+</div>
                <div className="text-muted small">Pelanggan Puas</div>
              </div>
            </Col>
            <Col xs={6} md={3} className="mb-3">
              <div className="bg-white rounded-4 shadow-sm py-3 px-2 d-flex flex-column align-items-center hs-hero-stat-glass">
                <FaCar className="text-warning mb-2" size={32} />
                <div className="fw-bold fs-4 text-warning">50+</div>
                <div className="text-muted small">Armada Aktif</div>
              </div>
            </Col>
            <Col xs={6} md={3} className="mb-3">
              <div className="bg-white rounded-4 shadow-sm py-3 px-2 d-flex flex-column align-items-center hs-hero-stat-glass">
                <FaRegClock className="text-success mb-2" size={32} />
                <div className="fw-bold fs-4 text-success">24 Jam</div>
                <div className="text-muted small">Layanan Nonstop</div>
              </div>
            </Col>
            <Col xs={6} md={3} className="mb-3">
              <div className="bg-white rounded-4 shadow-sm py-3 px-2 d-flex flex-column align-items-center hs-hero-stat-glass">
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
                <video
                  src="/images/gallery .mp4"
                  autoPlay
                  muted
                  controls
                  className="w-100 h-100"
                  style={{ objectFit: "cover", background: "#222" }}
                  poster=""
                  title="Profil Rental Mobil HS"
                >
                  Your browser does not support the video tag.
                </video>
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
                className="hs-gallery-card shadow-sm rounded-4 overflow-hidden position-relative"
                onClick={() => handleShow(item)}
                style={{ cursor: "pointer", background: "#fff" }}
              >
                <div className="hs-gallery-img-container position-relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="hs-gallery-img w-100"
                    style={{
                      height: 220,
                      objectFit: "cover",
                      transition: "transform 0.3s"
                    }}
                  />
                  <Badge bg="primary" className="hs-gallery-category-badge">
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
      <Modal show={showModal} onHide={handleClose} centered size="lg" contentClassName="hs-gallery-modal-content">
        <Modal.Body className="p-0 position-relative">
          <Button
            variant="light"
            className="hs-gallery-modal-close"
            onClick={handleClose}
            aria-label="Tutup"
          >
            <FaTimes />
          </Button>
          {activeImage && (
            <img
              src={activeImage.image}
              alt={activeImage.title}
              className="w-100 hs-gallery-modal-img"
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
            <div className="mt-3 d-flex align-items-center gap-3">
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleLike(activeImage.title)}
              >
                <FaHeart className="me-1" />
                Suka ({likes[activeImage.title] || 0})
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleShare(activeImage)}
              >
                <FaShareAlt className="me-1" />
                Bagikan
              </Button>
            </div>
          </Modal.Footer>
        )}
      </Modal>

      {/* MODAL UPLOAD FOTO */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload Foto Pengalaman</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Judul Foto</Form.Label>
              <Form.Control
                value={uploadTitle}
                onChange={e => setUploadTitle(e.target.value)}
                placeholder="Judul foto"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Kategori</Form.Label>
              <Form.Select
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
              >
                {categories.filter(c => c !== "Semua").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Foto</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={e => setUploadFile(e.target.files[0])}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Cerita di balik foto (opsional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={uploadStory}
                onChange={e => setUploadStory(e.target.value)}
                placeholder="Ceritakan pengalaman Anda..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>Batal</Button>
          <Button variant="success" onClick={handleUploadPhoto} disabled={uploading || !uploadFile || !uploadTitle}>
            {uploading ? <Spinner size="sm" /> : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* TESTIMONIAL SLIDER */}
      <section className="py-5 bg-white">
        <Container>
          <h2 className="fw-bold text-center mb-4" data-aos="fade-up">
            <FaStar className="me-2 text-warning" />
            Testimoni Pelanggan
          </h2>
          <Carousel indicators={false} controls={testimonials.length > 1} interval={5000} className="testimonial-carousel">
            {testimonials.map((t, i) => (
              <Carousel.Item key={i}>
                <div className="d-flex justify-content-center align-items-center py-4">
                  <div className="bg-white rounded-4 shadow-sm p-4 text-center mx-auto" style={{ maxWidth: 420, border: "1.5px solid #ffd70033" }}>
                    <div className="d-flex flex-column align-items-center mb-3">
                      <img
                        src={t.image}
                        alt={t.name}
                        className="rounded-circle mb-2"
                        style={{ width: 72, height: 72, objectFit: "cover", border: "3px solid #ffd700", boxShadow: "0 2px 8px #ffd70022" }}
                      />
                      <h5 className="fw-bold mb-1 text-primary">{t.name}</h5>
                      <div className="mb-2">
                        {[...Array(Math.floor(t.rating))].map((_, idx) => (
                          <FaStar key={idx} className="text-warning" />
                        ))}
                        {t.rating % 1 !== 0 && <FaStar className="text-warning" style={{ opacity: 0.5 }} />}
                      </div>
                    </div>
                    <p className="fst-italic text-secondary text-center" style={{ fontSize: "1.08rem", minHeight: 60 }}>
                      <FaQuoteLeft className="me-2 text-gold" />
                      {t.comment}
                      <FaQuoteRight className="ms-2 text-gold" />
                    </p>
                  </div>
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
                  src="https://www.google.com/maps?q=-7.543583,110.747000&hl=id&z=16&output=embed"
                  title="Lokasi Rental Mobil HS"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
              <div className="mt-3 text-center text-muted">
                <FaMapMarkerAlt className="me-1" />
                Jl. Watugajah Jl. Widyapura No.7, Dusun I, Singopuran, Kec. Kartasura, Kabupaten Sukoharjo
Jawa Tengah 57164
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

      
    </div>
  );
};

export default Gallery;