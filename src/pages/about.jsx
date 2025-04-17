import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AOS from "aos";
import "aos/dist/aos.css";

const App = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div>
      {/* Hero Section - Tentang Kami */}
      <section
        className="hero-section text-center text-white d-flex align-items-center justify-content-center py-5"
        style={{ background: "linear-gradient(135deg, #003973, #E5E5BE)", minHeight: "80vh" }}
      >
        <div className="container">
          <div className="content animate__animated animate__fadeIn">
            <h1 className="fw-bold display-4">🌟 Tentang Kami</h1>
            <p className="lead mt-3 mb-4">
              Kami adalah perusahaan penyedia layanan sewa mobil terpercaya sejak tahun 2000,
              berkomitmen memberikan pengalaman perjalanan terbaik untuk Anda.
            </p>
            <a href="/layanan" className="btn btn-warning fw-bold px-4 py-2">
              Lihat Layanan Kami
            </a>
          </div>
        </div>
      </section>

      {/* Info Section */}
<section className="py-5 bg-light">
  <div className="container">
    <div className="row align-items-center mb-5">
      <div className="col-md-6" data-aos="fade-right">
        <img
          src="/assets/mobil1.jpg"
          className="img-fluid rounded-4 shadow"
          alt="Sewa Mobil"
        />
      </div>
      <div className="col-md-6" data-aos="fade-left">
        <h2 className="fw-bold text-primary mb-3">
          <i className="fas fa-star me-2 text-warning"></i>Kenapa Memilih Kami?
        </h2>
        <p className="text-muted fs-5">
          Harga sewa bersaing, layanan pelanggan 24 jam, serta pilihan mobil lengkap dan terawat menjadikan kami pilihan tepat untuk segala kebutuhan transportasi Anda.
        </p>
        <ul className="list-unstyled mt-4">
          <li className="mb-2">
            <i className="fas fa-check-circle text-success me-2"></i>Proses pemesanan mudah & cepat
          </li>
          <li className="mb-2">
            <i className="fas fa-check-circle text-success me-2"></i>Armada bersih dan nyaman
          </li>
          <li>
            <i className="fas fa-check-circle text-success me-2"></i>Pelayanan ramah & profesional
          </li>
        </ul>
      </div>
    </div>

    <div className="row align-items-center flex-row-reverse">
      <div className="col-md-6" data-aos="fade-left">
        <img
          src="/assets/mobil2.jpg"
          className="img-fluid rounded-4 shadow"
          alt="Pengalaman Nyaman"
        />
      </div>
      <div className="col-md-6" data-aos="fade-right">
        <h2 className="fw-bold text-primary mb-3">
          <i className="fas fa-car-side me-2 text-danger"></i>Pengalaman Sewa Mobil yang Nyaman
        </h2>
        <p className="text-muted fs-5">
          Nikmati perjalanan tanpa khawatir dengan mobil bersih, fasilitas lengkap, dan sopir yang profesional. Kami hadir untuk memberikan pengalaman berkendara yang aman dan menyenangkan.
        </p>
        <div className="mt-4">
          <span className="badge bg-success fs-6 me-2">Bersih</span>
          <span className="badge bg-info text-dark fs-6 me-2">Aman</span>
          <span className="badge bg-primary fs-6">Terpercaya</span>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Contact Section */}
      <section className="container my-5 text-center">
        <h2 className="fw-bold text-primary" data-aos="fade-up">
          📍 TEMUKAN KAMI
        </h2>
        <div className="row mt-4">
          <div className="col-md-6" data-aos="fade-right">
            <iframe
              title="Lokasi Kami"
              src="https://www.google.com/maps/embed?pb=..."
              width="100%"
              height="350"
              className="rounded shadow-lg border-0"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
          <div
            className="col-md-6 bg-white p-4 rounded shadow-lg text-start"
            data-aos="fade-left"
          >
            <p>
              <i className="fas fa-map-marker-alt text-primary me-2"></i> Jl.
              Raya No.123, Jakarta
            </p>
            <p>
              <i className="fas fa-phone text-primary me-2"></i> +62 8777 911
              2748
            </p>
            <p>
              <i className="fas fa-envelope text-primary me-2"></i>{" "}
              sewamobil@gmail.com
            </p>
            <a href="/contact" className="btn btn-primary mt-3">
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
