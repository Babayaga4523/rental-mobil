import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { StarFill } from "react-bootstrap-icons";

const Testimoni = () => {
  const [testimoni, setTestimoni] = useState([]);
  const [nama, setNama] = useState("");
  const [pesan, setPesan] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTestimoni();
  }, []);

  const fetchTestimoni = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/testimoni");
      setTestimoni(response.data.data || response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post("http://localhost:3000/api/testimoni", {
        nama,
        pesan,
        rating,
        user_id: 1 // Ganti dengan user_id dari sistem auth
      });
      
      setNama("");
      setPesan("");
      setRating(5);
      fetchTestimoni();
    } catch (error) {
      console.error("Gagal kirim testimoni:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk render rating bintang
  const renderRating = (rating) => {
    return (
      <div className="d-flex">
        {[...Array(5)].map((_, i) => (
          <StarFill 
            key={i} 
            className={i < rating ? "text-warning" : "text-secondary"} 
            size={18}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="testimoni-page">
      {/* Hero Section */}
      <section className="testimoni-hero bg-primary text-white py-5">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold mb-3">
                <i className="bi bi-chat-square-quote me-2"></i>
                Testimoni Pelanggan
              </h1>
              <p className="lead mb-4">
                Bagikan pengalaman Anda menggunakan layanan kami
              </p>
              <a 
                href="#testimoni-form" 
                className="btn btn-light btn-lg rounded-pill px-4"
              >
                <i className="bi bi-pencil-square me-2"></i>
                Tulis Testimoni
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni Form */}
      <section id="testimoni-form" className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4 p-md-5">
                  <h2 className="text-center mb-4 fw-bold text-primary">
                    <i className="bi bi-pencil-square me-2"></i>
                    Tulis Testimoni
                  </h2>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="nama" className="form-label fw-semibold">
                        Nama Anda
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-pill"
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
                      <label className="form-label fw-semibold">
                        Rating
                      </label>
                      <select
                        className="form-select form-select-lg"
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                      >
                        <option value={5}>Sangat Memuaskan (5 Bintang)</option>
                        <option value={4}>Memuaskan (4 Bintang)</option>
                        <option value={3}>Cukup Baik (3 Bintang)</option>
                        <option value={2}>Kurang (2 Bintang)</option>
                        <option value={1}>Tidak Puas (1 Bintang)</option>
                      </select>
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg rounded-pill fw-bold py-3"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send-check me-2"></i>
                            Kirim Testimoni
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni List */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-primary">
              <i className="bi bi-chat-left-quote me-2"></i>
              Apa Kata Mereka?
            </h2>
            <p className="lead text-muted">
              Testimoni jujur dari pelanggan kami
            </p>
          </div>

          <div className="row g-4">
            {testimoni.length > 0 ? (
              testimoni.map((item) => (
                <div className="col-md-6 col-lg-4" key={item.id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="mb-3">
                        {renderRating(item.rating)}
                      </div>
                      <p className="card-text flex-grow-1 mb-4 fst-italic">
                        "{item.pesan}"
                      </p>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                          <span className="fs-5 fw-bold">{item.nama.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ms-3">
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
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Belum ada testimoni. Jadilah yang pertama!
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Testimoni;