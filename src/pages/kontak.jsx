import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import { API_URL } from "../utils/api";

const ContactPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  // State untuk form
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [pesan, setPesan] = useState("");
  const [status, setStatus] = useState(""); // Untuk menampilkan pesan sukses/gagal

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(""); // Reset status sebelum mengirim

    try {
      const response = await axios.post(`${API_URL}/contact`, {
        nama,
        email,
        pesan,
      });

      if (response.status === 200) {
        setStatus("Pesan berhasil dikirim!");
        setNama("");
        setEmail("");
        setPesan("");
      } else {
        setStatus("Gagal mengirim pesan. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error mengirim pesan:", error);
      setStatus("Terjadi kesalahan. Coba lagi nanti.");
    }
  };

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 text-center" data-aos="fade-up">
        <h1 className="display-4 fw-bold">Hubungi Kami</h1>
        <p className="lead">Siap melayani Anda dengan sepenuh hati</p>
      </div>

      {/* Contact Form Section */}
      <div className="container my-5" data-aos="fade-up">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg p-4">
              <h2 className="text-center mb-4 fw-bold">Kirim Pesan</h2>
              {status && <div className="alert alert-info">{status}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nama</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nama Anda"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Pesan</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Pesan Anda"
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Kirim
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Section */}
      <div className="container my-5" data-aos="fade-up">
        <h2 className="text-center mb-4 fw-bold">Info Kontak</h2>
        <div className="row text-center">
          <div className="col-md-4">
            <i className="fas fa-map-marker-alt fa-2x text-primary mb-2"></i>
            <p>Crown Palace, Jl. Prof. DR. Soepomo No.231 Block B-20, Jakarta</p>
          </div>
          <div className="col-md-4">
            <i className="fas fa-phone fa-2x text-primary mb-2"></i>
            <p>+62 8777 9112 748</p>
          </div>
          <div className="col-md-4">
            <i className="fas fa-envelope fa-2x text-primary mb-2"></i>
            <p>airmarindo@gmail.com</p>
          </div>
        </div>
      </div>

      {/* Google Map Section */}
      <div className="container my-5" data-aos="fade-up">
        <h2 className="text-center mb-4 fw-bold">Lokasi Kami</h2>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15864.790497975033!2d106.843768!3d-6.237663!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3957dafffff%3A0x8e14483ad5869d9d!2sAir%20Marindo!5e0!3m2!1sid!2sid!4v1731483660016!5m2!1sid!2sid"
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Lokasi Kami"
        ></iframe>
      </div>

      {/* Info Armada Section */}
      <div className="container my-5" data-aos="fade-up">
        <div className="alert alert-info rounded-4 shadow-sm mb-4" data-aos="fade-up" data-aos-delay="100">
          <strong>Info:</strong> Semua mobil yang tampil di halaman ini <b>khusus untuk rental dalam kota</b> (Jabodetabek). 
          <br className="d-none d-md-block" />
          Untuk kebutuhan <b>luar kota, drop-off bandara, atau perjalanan khusus</b>, silakan <a href="https://wa.me/6281381339149" target="_blank" rel="noopener noreferrer" className="fw-bold text-primary">chat admin</a> untuk konsultasi & penawaran terbaik!
        </div>
        <h2 className="text-center mb-4 fw-bold">Armada Kami</h2>
        <div className="row">
          {/* Daftar mobil akan ditampilkan di sini */}
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <img src="https://via.placeholder.com/350x200" className="card-img-top" alt="Mobil 1" />
              <div className="card-body">
                <h5 className="card-title">Toyota Avanza</h5>
                <p className="card-text">
                  Kapasitas: 7 Penumpang
                  <br />
                  AC: Ya
                  <br />
                  Transmisi: Manual
                </p>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary w-100" onClick={() => alert("Pesan Toyota Avanza")}>
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <img src="https://via.placeholder.com/350x200" className="card-img-top" alt="Mobil 2" />
              <div className="card-body">
                <h5 className="card-title">Honda Jazz</h5>
                <p className="card-text">
                  Kapasitas: 5 Penumpang
                  <br />
                  AC: Ya
                  <br />
                  Transmisi: Otomatis
                </p>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary w-100" onClick={() => alert("Pesan Honda Jazz")}>
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm">
              <img src="https://via.placeholder.com/350x200" className="card-img-top" alt="Mobil 3" />
              <div className="card-body">
                <h5 className="card-title">Suzuki Ertiga</h5>
                <p className="card-text">
                  Kapasitas: 7 Penumpang
                  <br />
                  AC: Ya
                  <br />
                  Transmisi: Manual
                </p>
                <div className="d-flex gap-2">
                  <button className="btn btn-primary w-100" onClick={() => alert("Pesan Suzuki Ertiga")}>
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/6281381339149"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa-cta"
        title="Chat Admin Rental Mobil HS"
      >
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  );
};

export default ContactPage;
