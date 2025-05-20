import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { StarFill, Star } from "react-bootstrap-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../style/Testimoni.css";

const BACKEND_URL = "http://localhost:3000";

const Testimoni = () => {
  const [testimoni, setTestimoni] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [layananId, setLayananId] = useState("");
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 900, once: true, easing: 'ease-in-out' });
    fetchTestimoni();
    fetchLayanan();
  }, []);

  const fetchTestimoni = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/testimoni`);
      setTestimoni(response.data.data || response.data);
    } catch (error) {
      toast.error("Gagal memuat testimoni");
    }
  };

  const fetchLayanan = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/layanan`);
      setLayananList(response.data.data || response.data);
    } catch (error) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!layananId) {
      toast.error("Pilih mobil yang ingin diberi testimoni!", { position: "top-center" });
      return;
    }
    setLoading(true);

    try {
      await axios.post(`${BACKEND_URL}/api/testimoni`, {
        nama,
        pesan,
        rating,
        user_id: 1,
        layanan_id: layananId
      });

      setNama("");
      setPesan("");
      setRating(5);
      setLayananId("");
      await fetchTestimoni();

      toast.success("Testimoni berhasil dikirim!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error("Gagal mengirim testimoni", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const renderRating = (ratingValue) => (
    <div className="d-flex rating-stars">
      {[1, 2, 3, 4, 5].map((star) =>
        star <= ratingValue
          ? <StarFill key={star} className="text-warning" size={20} />
          : <Star key={star} className="text-warning" size={20} />
      )}
    </div>
  );

  const renderRatingInput = () => (
    <div className="d-flex mb-3 rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(star)}
          style={{ cursor: "pointer" }}
        >
          {star <= (hoverRating || rating)
            ? <StarFill className="text-warning" size={28} />
            : <Star className="text-warning" size={28} />}
        </span>
      ))}
      <span className="ms-2 fw-bold text-warning">
        {hoverRating || rating}/5
      </span>
    </div>
  );

  return (
    <div className="testimoni-page">
      {/* Hero Section */}
      <section className="testimoni-hero position-relative overflow-hidden">
        <div className="hero-overlay"></div>
        <div className="container h-100 position-relative z-index-1">
          <div className="row h-100 align-items-center">
            <div className="col-lg-9 mx-auto text-center">
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="hero-title display-3 fw-bold mb-4 text-white"
                data-aos="fade-up"
              >
                <i className="fas fa-star text-warning me-2"></i>
                Bagikan <span className="text-gradient">Pengalaman</span> Anda
              </motion.h1>
              <p 
                className="hero-subtitle lead text-light opacity-75 mb-5 mx-auto" 
                style={{ maxWidth: "650px" }}
                data-aos="fade-up"
                data-aos-delay="100"
              >
                Ceritakan pengalaman menyewa mobil dengan kami dan bantu kami menjadi lebih baik.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-gradient btn-lg rounded-pill px-4 py-3 shadow"
                onClick={() => document.getElementById('testimoni-form').scrollIntoView({ behavior: 'smooth' })}
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <i className="fas fa-pen me-2"></i>Tulis Testimoni
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni Form */}
      <section id="testimoni-form" className="py-7">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card border-0 shadow-lg rounded-4 overflow-hidden glass-card"
                data-aos="fade-up"
              >
                <div className="card-header bg-gradient text-white py-4">
                  <h2 className="mb-0 text-center fw-bold">
                    <i className="fas fa-edit me-3"></i>
                    Form Testimoni
                  </h2>
                </div>
                <div className="card-body p-5">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="layanan" className="form-label fw-semibold">
                        Pilih Mobil
                      </label>
                      <select
                        className="form-select form-select-lg rounded-3"
                        id="layanan"
                        value={layananId}
                        onChange={e => setLayananId(e.target.value)}
                        required
                      >
                        <option value="">-- Pilih Mobil --</option>
                        {layananList.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="nama" className="form-label fw-semibold">
                        Nama Anda
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-3"
                        id="nama"
                        placeholder="Nama lengkap"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="pesan" className="form-label fw-semibold">
                        Pesan Testimoni
                      </label>
                      <textarea
                        className="form-control rounded-3"
                        id="pesan"
                        rows={5}
                        placeholder="Bagikan pengalaman Anda..."
                        value={pesan}
                        onChange={(e) => setPesan(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Rating</label>
                      {renderRatingInput()}
                    </div>

                    <div className="d-grid">
                      <motion.button
                        type="submit"
                        className="btn btn-gradient btn-lg rounded-pill fw-bold py-3 shadow"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Kirim Testimoni
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni List */}
      <section className="testimoni-list py-7 bg-light">
        <div className="container">
          <div className="section-header text-center mb-6" data-aos="fade-up">
            <h2 className="section-title display-5 fw-bold mb-3">
              <i className="fas fa-quote-left text-primary me-3"></i>
              Apa Kata Pelanggan Kami
            </h2>
            <p className="section-subtitle lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
              Testimoni jujur dari pelanggan yang telah menggunakan layanan kami
            </p>
          </div>

          <div className="row g-4">
            {testimoni.length > 0 ? (
              testimoni.map((item, index) => (
                <div 
                  className="col-md-6 col-lg-4" 
                  key={item.id}
                  data-aos="fade-up"
                  data-aos-delay={index % 3 * 100}
                >
                  <motion.div
                    whileHover={{ y: -10, scale: 1.03 }}
                    className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white glass-card"
                  >
                    <div className="card-body p-4 d-flex flex-column position-relative">
                      <div className="testimoni-quote-icon">
                        <i className="fas fa-quote-left text-gradient"></i>
                      </div>
                      <div className="mb-3">
                        {renderRating(item.rating)}
                      </div>
                      <p className="card-text flex-grow-1 mb-4 fst-italic position-relative">
                        {item.pesan}
                      </p>
                      <div className="d-flex align-items-center mt-auto">
                        <div className="avatar-gradient rounded-circle d-flex align-items-center justify-content-center me-3">
                          <span className="fs-5 fw-bold">{item.nama.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h6 className="mb-0 fw-bold">{item.nama}</h6>
                          <small className="text-muted">
                            {new Date(item.createdAt || item.tanggal).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </small>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5" data-aos="fade-up">
                <div className="alert alert-info d-inline-flex align-items-center py-3 px-4 rounded-pill">
                  <i className="fas fa-info-circle me-3 fs-4"></i>
                  <span className="fw-medium">Belum ada testimoni. Jadilah yang pertama!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Testimoni;