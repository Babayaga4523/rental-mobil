import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import dummyLayanan from "../data/dummyLayanan";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";

const AboutCar = () => {
  const { id } = useParams();
  const car = dummyLayanan.find((item) => item.id === parseInt(id));
  const [mainImage, setMainImage] = useState(car?.gambar);
  const [days, setDays] = useState(1);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    // Ambil data testimoni dari server
    fetch(`http://localhost:5000/api/testimonials?carId=${id}`)
      .then((response) => response.json())
      .then((data) => setTestimonials(data))
      .catch((error) => console.error("Error fetching testimonials:", error));
  }, [id]);

  if (!car) {
    return <h2 className="text-center mt-5 text-danger">❌ Mobil tidak ditemukan!</h2>;
  }

  const totalPrice = car.harga * days;

  return (
    <div className="container py-5">
      <div className="row g-4 align-items-center">
        {/* Image Section */}
        <div className="col-md-6">
          <div className="card shadow-lg border-0">
            <img
              src={mainImage}
              alt={car.nama}
              className="card-img-top rounded animate__animated animate__fadeIn"
            />
            <div className="card-body text-center">
              <div className="d-flex justify-content-center gap-2">
                {car.galeri?.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`img-thumbnail rounded shadow-sm ${mainImage === img ? "border-primary border-3" : ""}`}
                    style={{ width: "80px", height: "80px", cursor: "pointer" }}
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="col-md-6">
          <h1 className="fw-bold text-primary animate__animated animate__fadeInDown">{car.nama}</h1>
          <h3 className="text-success fw-bold">Rp {car.harga.toLocaleString()}/hari</h3>
          <p className="text-muted">{car.deskripsi}</p>

          <div className="mb-3">
            <label className="form-label fw-bold">Jumlah Hari:</label>
            <input
              type="number"
              className="form-control w-50 text-center"
              min="1"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>

          <h4 className="fw-bold text-danger">Total Harga: Rp {totalPrice.toLocaleString()}</h4>

          <button className="btn btn-primary w-100 shadow-sm mb-2">🚗 Pesan Sekarang</button>
          <a href="/layanan" className="btn btn-outline-secondary w-100 shadow-sm">🔙 Kembali ke daftar mobil</a>

          {/* Customer Reviews Section */}
          <div className="mt-5">
            <h4 className="fw-bold">💬 Ulasan Pelanggan</h4>
            <div className="list-group">
              {testimonials.length > 0 ? (
                testimonials.map((testimonial, index) => (
                  <div key={index} className="list-group-item">
                    ⭐ <strong>{testimonial.nama}:</strong> "{testimonial.ulasan}"
                  </div>
                ))
              ) : (
                <div className="list-group-item text-muted">Belum ada ulasan untuk mobil ini.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutCar;
