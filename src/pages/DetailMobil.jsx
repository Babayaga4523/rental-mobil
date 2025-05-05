import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-in-out'
    });

    
      fetch(`http://localhost:3000/api/layanan/${id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Mobil tidak ditemukan");
          }
          return response.json();
        })
        .then((data) => {
          setCar(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching car data:", error);
          setError(error.message);
          setLoading(false);
        });
    }, [id]);
  
    

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center" data-aos="zoom-in">
          <div className="spinner-grow text-primary" style={{width: '4rem', height: '4rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 className="mt-4 text-primary">Memuat detail mobil...</h3>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div 
          className="text-center p-5 bg-white rounded-4 shadow" 
          style={{maxWidth: '600px'}}
          data-aos="zoom-in"
        >
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle text-danger" style={{fontSize: '5rem'}}></i>
          </div>
          <h2 className="fw-bold mb-3">Oops! Terjadi Kesalahan</h2>
          <p className="fs-5 mb-4">{error || 'Data mobil tidak tersedia'}</p>
          <button 
            className="btn btn-primary px-4 py-2 rounded-pill fw-bold"
            onClick={() => navigate("/layanan")}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <i className="fas fa-arrow-left me-2"></i> Kembali ke Daftar Mobil
          </button>
        </div>
      </div>
    );
  }

  // Safely calculate prices with default values
  const harga = car.harga || 0;
  const diskon = car.diskon || 0;
  const totalPrice = harga * days;
  const discountedPrice = diskon ? totalPrice - (totalPrice * diskon / 100) : totalPrice;

  const handleBooking = () => {
    navigate("/booking", {
      state: {
        carId: car.id,
        carName: car.nama,
        price: harga,
        days,
        totalPrice: discountedPrice,
        image: car.gambar || '/images/default-car.jpg',
        discount: diskon
      }
    });
  };

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <div className="bg-dark text-white py-5">
        <div className="container">
          <button 
            onClick={() => navigate("/layanan")}
            className="btn btn-outline-light mb-4 rounded-pill"
            data-aos="fade-right"
          >
            <i className="fas fa-arrow-left me-2"></i> Kembali
          </button>
          <h1 className="display-4 fw-bold mb-3" data-aos="fade-up">{car.nama || 'Mobil Premium'}</h1>
          <div className="d-flex align-items-center" data-aos="fade-up" data-aos-delay="100">
            <span className="bg-primary px-3 py-1 rounded-pill me-3">
              {car.kategori || 'Standard'}
            </span>
            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <i 
                  key={i}
                  className={`fas fa-star ${i < (car.rating || 4) ? 'text-warning' : 'text-secondary'}`}
                ></i>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5">
        <div className="row g-5">
          {/* Car Images */}
          <div className="col-lg-7">
            <div 
              className="card border-0 shadow-lg rounded-4 overflow-hidden mb-4"
              data-aos="zoom-in"
            >
              <img
                src={car.gambar || '/images/default-car.jpg'}
                alt={car.nama || 'Mobil'}
                className="img-fluid w-100"
                style={{height: '450px', objectFit: 'cover'}}
                onError={(e) => {
                  e.target.src = '/images/default-car.jpg';
                }}
              />
            </div>
            
            {/* Tabs */}
            <div 
              className="card border-0 shadow-sm rounded-4 overflow-hidden"
              data-aos="fade-up"
            >
              <div className="card-header bg-white">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'description' ? 'active' : ''}`}
                      onClick={() => setActiveTab('description')}
                    >
                      <i className="fas fa-info-circle me-2"></i> Deskripsi
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body">
                {activeTab === 'description' && (
                  <div>
                    <h5 className="fw-bold" data-aos="fade-up">Tentang Mobil Ini</h5>
                    <p className="lead" data-aos="fade-up" data-aos-delay="100">
                      {car.deskripsi || 'Mobil premium dengan fasilitas lengkap dan nyaman untuk perjalanan Anda.'}
                    </p>
                    <div className="mt-4">
                      <h6 className="fw-bold" data-aos="fade-up" data-aos-delay="150">Fitur Utama:</h6>
                      <div className="row mt-3">
                        {['AC', 'Audio', 'Kamera Mundur', 'GPS', 'Bluetooth', 'USB Port'].map((feature, i) => (
                          <div 
                            key={i} 
                            className="col-md-6 mb-2"
                            data-aos="fade-up"
                            data-aos-delay={200 + (i * 50)}
                          >
                            <i className="fas fa-check-circle text-success me-2"></i>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="col-lg-5">
            <div 
              className="card border-0 shadow-lg rounded-4 sticky-top" 
              style={{top: '20px'}}
              data-aos="fade-left"
            >
              <div className="card-header bg-primary text-white py-3 rounded-top-4">
                <h4 className="mb-0 fw-bold">
                  <i className="fas fa-tag me-2"></i> Harga Sewa
                </h4>
              </div>
              <div className="card-body">
                <div 
                  className="d-flex justify-content-between align-items-center mb-3"
                  data-aos="fade-up"
                >
                  <span className="text-muted">Harga per hari:</span>
                  <span className="fw-bold">Rp {harga.toLocaleString('id-ID')}</span>
                </div>
                
                <div 
                  className="mb-4"
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <label className="form-label fw-bold">Durasi Sewa (hari):</label>
                  <div className="input-group">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setDays(Math.max(1, days - 1))}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      min="1"
                      value={days}
                      onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                    />
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setDays(days + 1)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
                
                {diskon > 0 && (
                  <div 
                    className="alert alert-success py-2 mb-3"
                    data-aos="zoom-in"
                    data-aos-delay="150"
                  >
                    <div className="d-flex justify-content-between">
                      <span>
                        <i className="fas fa-percentage me-2"></i> Diskon {diskon}%
                      </span>
                      <span>- Rp {(totalPrice * diskon / 100).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}
                
                <div 
                  className="bg-light p-3 rounded-3 mb-4"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Total Harga:</h5>
                    <h3 className="mb-0 text-success fw-bold">
                      Rp {discountedPrice.toLocaleString('id-ID')}
                    </h3>
                  </div>
                  <small className="text-muted">Termasuk pajak dan asuransi</small>
                </div>
                
                <button 
                  className="btn btn-primary btn-lg w-100 py-3 fw-bold mb-3"
                  onClick={handleBooking}
                  data-aos="zoom-in"
                  data-aos-delay="250"
                >
                  <i className="fas fa-calendar-check me-2"></i> Pesan Sekarang
                </button>
                
                <div className="text-center">
                  <small className="text-muted">
                    <i className="fas fa-lock me-1"></i> Pembayaran aman dan terjamin
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;