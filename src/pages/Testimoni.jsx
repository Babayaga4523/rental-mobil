import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Testimoni = () => {
  const [testimoni, setTestimoni] = useState([]);
  const [nama, setNama] = useState("");
  const [ulasan, setUlasan] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchTestimoni();
  }, []);

  const fetchTestimoni = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/testimoni");
      setTestimoni(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/testimoni", {
        nama,
        ulasan,
        rating,
      });
      setNama("");
      setUlasan("");
      setRating(5);
      fetchTestimoni();
    } catch (error) {
      console.error("Gagal kirim testimoni:", error);
    }
  };

  return (
    <div>
      {/* Hero Section - Tentang Kami */}
      <section
  className="hero-section text-center text-white d-flex align-items-center justify-content-center py-5"
  style={{
    background: "linear-gradient(135deg, #FF6B6B, #FFD93D)",
    minHeight: "80vh",
  }}
>
  <div className="container">
    <div className="content animate__animated animate__fadeIn">
      <h1 className="fw-bold display-4">📝 Testimoni Pelanggan</h1>
      <p className="lead mt-3 mb-4">
        Dengarkan langsung dari pelanggan kami tentang pengalaman mereka
        menggunakan layanan kami!
      </p>
      <a href="#form-ulasan" className="btn btn-dark fw-bold px-4 py-2 rounded-pill">
        Tulis Ulasan Sekarang
      </a>
    </div>
  </div>
</section>


      {/* Section Form Testimoni */}
      <div className="container py-5" id="form-ulasan">
        <h2 className="text-center fw-bold mb-4 text-warning">Testimoni Pelanggan</h2>

        <div className="row justify-content-center mb-5">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 bg-light">
              <div className="card-body p-4">
                <h4 className="mb-4 text-center text-dark">Tulis Ulasan Anda</h4>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control rounded-pill"
                      placeholder="Nama Anda"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <textarea
                      className="form-control rounded-3"
                      rows={4}
                      placeholder="Tulis ulasan..."
                      value={ulasan}
                      onChange={(e) => setUlasan(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Rating</label>
                    <select
                      className="form-select"
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (Sangat Baik)</option>
                      <option value={4}>⭐⭐⭐⭐ (Baik)</option>
                      <option value={3}>⭐⭐⭐ (Cukup)</option>
                      <option value={2}>⭐⭐ (Kurang)</option>
                      <option value={1}>⭐ (Buruk)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-outline-warning w-100 rounded-pill fw-semibold"
                  >
                    Kirim Testimoni
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Ulasan */}
        <h3 className="text-center mb-4 text-dark">Ulasan Pelanggan</h3>
        <div className="row g-4">
          {testimoni.length > 0 ? (
            testimoni.map((item) => (
              <div className="col-md-6 col-lg-4" key={item.id}>
                <div className="card h-100 border-0 shadow rounded-4 bg-white">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <h5 className="card-title fw-bold text-dark">{item.nama}</h5>
                      <p className="card-text text-muted">{item.ulasan}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-warning fs-5">
                        {"⭐".repeat(item.rating)}
                      </p>
                      <small className="text-secondary">
                        {new Date(item.tanggal).toLocaleString()}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">Belum ada testimoni.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Testimoni;
