import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

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
      const response = await axios.post("http://localhost:5000/api/contact", {
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
    </div>
  );
};

export default ContactPage;
