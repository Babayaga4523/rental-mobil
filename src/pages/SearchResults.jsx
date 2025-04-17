import React from "react";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const layanan = [
  {
    id: 1,
    nama: "Sewa Avanza",
    harga: "Rp 500.000/hari",
    deskripsi: "Mobil keluarga nyaman untuk perjalanan jauh.",
    gambar: "/Innova.jpeg",
  },
  {
    id: 2,
    nama: "Sewa Innova",
    harga: "Rp 700.000/hari",
    deskripsi: "Cocok untuk perjalanan keluarga dan bisnis.",
    gambar: "/fortuner.jpeg",
  },
  {
    id: 3,
    nama: "Sewa Alphard",
    harga: "Rp 2.000.000/hari",
    deskripsi: "Mobil mewah dengan kenyamanan tinggi.",
    gambar: "/images/alphard.jpg",
  },
];

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults = () => {
  const query = useQuery().get("query") || "";

  const filteredCars = layanan.filter(
    (mobil) =>
      mobil.nama.toLowerCase().includes(query.toLowerCase()) ||
      mobil.deskripsi.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4 fw-bold text-primary">
        {query ? `Hasil Pencarian: "${query}"` : "🚘 Layanan Sewa Mobil"}
      </h1>

      <div className="row g-4">
        {filteredCars.length > 0 ? (
          filteredCars.map((mobil) => (
            <div key={mobil.id} className="col-md-4">
              <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                <div className="ratio ratio-16x9">
                  <img
                    src={mobil.gambar}
                    className="card-img-top img-fluid"
                    alt={mobil.nama}
                    style={{ objectFit: "contain", padding: "10px" }}
                  />
                </div>
                <div className="card-body text-center d-flex flex-column justify-content-between">
                  <h5 className="card-title fw-bold text-dark">{mobil.nama}</h5>
                  <p className="card-text text-muted">{mobil.deskripsi}</p>
                  <p className="text-success fw-bold fs-5">{mobil.harga}</p>
                  <button className="btn btn-primary w-100 fw-semibold">
                    🚗 Sewa Sekarang
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-danger text-center">
              ❌ <strong>Mobil tidak ditemukan!</strong> Coba kata kunci lain.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
