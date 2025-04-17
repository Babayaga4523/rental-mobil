import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 mt-5 shadow-lg border-top">
      <div className="container text-center">
        <h5 className="fw-bold mb-3">
          🚗 Rental Mobil - Perjalanan Nyaman & Aman
        </h5>

        <div className="d-flex justify-content-center gap-4 mb-4">
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light fs-4"
            aria-label="Facebook"
          >
            <i className="fab fa-facebook-f"></i>
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light fs-4"
            aria-label="Instagram"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light fs-4"
            aria-label="Twitter"
          >
            <i className="fab fa-twitter"></i>
          </a>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="text-light fs-4"
            aria-label="WhatsApp"
          >
            <i className="fab fa-whatsapp"></i>
          </a>
        </div>

        <p className="mb-2">&copy; 2024 Rental Mobil. Semua Hak Dilindungi.</p>
        <p className="text-secondary small mb-0">
          Versi 1.0.0 &nbsp;|&nbsp;{" "}
          <a
            href="/privacy-policy"
            className="text-secondary text-decoration-none"
          >
            Kebijakan Privasi
          </a>{" "}
          &nbsp;|&nbsp;{" "}
          <a
            href="/terms"
            className="text-secondary text-decoration-none"
          >
            Syarat & Ketentuan
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
