import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import dummyLayanan from "../data/dummyLayanan";
import "./Layanan.css";

const Layanan = () => {
  const [layanan, setLayanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      setLayanan(dummyLayanan);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = () => {
    document.getElementById("layanan-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Hero Section */}
      <section
        className="hero-section text-center text-white d-flex align-items-center justify-content-center py-5"
        style={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)" }}
      >
        <div className="content container animate__animated animate__fadeIn">
          <h1 className="fw-bold display-4">🚗 Layanan Sewa Mobil Berkualitas</h1>
          <p className="lead mb-4">
            Jelajahi berbagai pilihan mobil terbaik yang kami sediakan untuk kebutuhan Anda.
          </p>
          <button className="btn btn-warning fw-bold px-4 py-2" onClick={handleSearch}>
            🎯 Lihat Daftar Layanan
          </button>
        </div>
      </section>

      {/* Layanan Section */}
      <section id="layanan-section" style={{ backgroundColor: "#f8f9fc" }} className="py-5">
        <div className="container">
          <h2
            className="text-center fw-bold mb-5 animate__animated animate__fadeInDown"
            style={{ color: "#1e3c72" }}
          >
            🛻 Pilih Layanan Sesuai Kebutuhan Anda
          </h2>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {layanan.map((item) => (
                <div className="col-lg-4 col-md-6" key={item.id}>
                  <div className="card shadow-sm h-100 border-0 animate__animated animate__fadeInUp">
                    <img
                      src={item.gambar}
                      className="card-img-top"
                      alt={item.nama}
                      style={{ height: "220px", objectFit: "cover" }}
                    />
                    <div className="card-body text-center">
                      <h5 className="card-title fw-bold" style={{ color: "#1e3c72" }}>
                        {item.nama}
                      </h5>
                      
                      <h6 className="fw-bold" style={{ color: "#2a5298" }}>
                        Rp {item.harga.toLocaleString("id-ID")}
                      </h6>
                    </div>
                    <div className="card-footer bg-white text-center border-0">
                      <button
                        className="btn w-75"
                        style={{ backgroundColor: "", color: "#fff" }}
                        onClick={() => navigate(`/detail/${item.id}`)}
                      >
                       Pesan Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-5">
            <h4 className="fw-bold text-secondary mb-3">
              Belum yakin? Lihat ulasan pelanggan kami!
            </h4>
            <button className="btn btn-outline-primary btn-lg shadow-sm">📲 Hubungi Kami</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Layanan;
