import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { API_URL } from "../utils/api";

// Custom hook to get query parameters from URL
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults = () => {
  const query = useQuery().get("query") || "";
  const [layanan, setLayanan] = useState([]); // State to store the fetched data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetching data from API
  useEffect(() => {
    const fetchLayanan = async () => {
      try {
        const response = await fetch(`${API_URL}/layanan`);
        if (!response.ok) {
          throw new Error("Data tidak ditemukan");
        }
        const data = await response.json();
        setLayanan(data); // Set the fetched data to the state
      } catch (error) {
        setError(error.message); // Set error if there's any
      } finally {
        setLoading(false); // Stop loading once the fetch is complete
      }
    };

    fetchLayanan(); // Call the fetch function when the component mounts
  }, []); // Empty dependency array to run only once on mount

  // Filter cars based on search query
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

      {loading ? (
        <div className="text-center">Memuat data...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
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
      )}
    </div>
  );
};

export default SearchResults;
