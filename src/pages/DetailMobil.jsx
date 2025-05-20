import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AOS from "aos";
import "aos/dist/aos.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../style/DetailMobilPage.css";

const defaultCarImage = '/images/default-car.jpg';
const defaultGalleryImages = [
  '/images/car-interior.jpg',
  '/images/car-side.jpg',
  '/images/car-back.jpg'
];
const BACKEND_URL = "http://localhost:3000";

const DetailMobil = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [days, setDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: 'ease-in-out' });

    fetch(`${BACKEND_URL}/api/layanan/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Mobil tidak ditemukan");
        return response.json();
      })
      .then((data) => {
        setCar(data.data);
        const processedImages = [];
        if (data.data.gambar) {
          processedImages.push(
            data.data.gambar.startsWith("http")
              ? data.data.gambar
              : BACKEND_URL + data.data.gambar
          );
        } else {
          processedImages.push(defaultCarImage);
        }
        setGalleryImages([...processedImages, ...defaultGalleryImages]);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  const handleImageError = (imgElement, fallbackImage) => {
    imgElement.src = fallbackImage;
    imgElement.onerror = null;
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };

  const harga = car?.harga || 0;
  const diskon = car?.promo || 0;
  const totalPrice = harga * days;
  const discountedPrice = diskon ? totalPrice - (totalPrice * diskon / 100) : totalPrice;

  const handleBooking = () => {
    if (!car) return;
    navigate("/booking", {
      state: {
        carId: car.id,
        carName: car.nama,
        price: harga,
        days,
        totalPrice: discountedPrice,
        image: car.gambar || defaultCarImage,
        discount: diskon
      }
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center" data-aos="zoom-in">
          <div className="spinner-grow text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
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
          style={{ maxWidth: '600px' }}
          data-aos="zoom-in"
        >
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '5rem' }}></i>
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

  return (
    <div className="car-detail-root bg-light" style={{ paddingTop: '80px' }}>
      {/* Hero Section */}
      <div className="car-detail-hero position-relative">
        <div className="container car-detail-hero-content">
          <button
            onClick={() => navigate("/layanan")}
            className="btn btn-outline-light car-detail-back-btn"
            data-aos="fade-right"
          >
            <i className="fas fa-arrow-left me-2"></i> Kembali
          </button>
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="car-detail-title mb-3" data-aos="fade-up">
                {car.nama || 'Mobil Premium'}
              </h1>
              <div className="d-flex align-items-center" data-aos="fade-up" data-aos-delay="100">
                <span className="badge car-detail-category px-3 py-2 rounded-pill">
                  <i className="fas fa-car me-2"></i>
                  {car.kategori || 'Standard'}
                </span>
                <div className="car-detail-rating">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star ${i < Math.round(car.rating || 0) ? 'text-warning' : 'text-light opacity-25'}`}
                    ></i>
                  ))}
                  <span className="ms-2">
                    {car.rating ? car.rating.toFixed(1) : "-"}
                    {car.jumlah_review ? ` (${car.jumlah_review} review)` : " Belum ada rating"}
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <div className="car-detail-hero-price" data-aos="fade-left">
                <span>Rp {harga.toLocaleString('id-ID')}</span>
                <span className="text-muted ms-2" style={{ fontWeight: 400 }}>/hari</span>
              </div>
            </div>
          </div>
        </div>
        <div className="car-detail-hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-5 car-detail-main">
        <div className="row g-5">
          {/* Car Images & Tabs */}
          <div className="col-lg-7">
            <div className="car-detail-image-section" data-aos="zoom-in">
              <div className="car-detail-image-main-wrapper">
                <img
                  src={galleryImages[currentImageIndex]}
                  alt={car.nama || 'Mobil'}
                  className="car-detail-image-main"
                  onError={e => { e.target.src = defaultCarImage; }}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="car-detail-tabs-card" data-aos="fade-up">
              <div className="car-detail-tabs-header">
                <ul className="nav nav-tabs card-header-tabs">
                  <li className="nav-item">
                    <button
                      className={`nav-link car-detail-tab-link${activeTab === 'description' ? ' active' : ''}`}
                      onClick={() => setActiveTab('description')}
                    >
                      <i className="fas fa-info-circle me-2"></i> Deskripsi
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link car-detail-tab-link${activeTab === 'specs' ? ' active' : ''}`}
                      onClick={() => setActiveTab('specs')}
                    >
                      <i className="fas fa-cogs me-2"></i> Spesifikasi
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link car-detail-tab-link${activeTab === 'reviews' ? ' active' : ''}`}
                      onClick={() => setActiveTab('reviews')}
                    >
                      <i className="fas fa-star me-2"></i> Ulasan
                    </button>
                  </li>
                </ul>
              </div>
              <div className="car-detail-tabs-body">
                {activeTab === 'description' && (
                  <div>
                    <h5 className="fw-bold car-detail-description-title" data-aos="fade-up">Tentang Mobil Ini</h5>
                    <p className="lead car-detail-description-text" data-aos="fade-up" data-aos-delay="100">
                      {car.deskripsi || 'Mobil premium dengan fasilitas lengkap dan nyaman untuk perjalanan Anda.'}
                    </p>
                    <div className="mt-4">
                      <h6 className="fw-bold car-detail-features-title" data-aos="fade-up" data-aos-delay="150">Fitur Utama:</h6>
                      <div className="row mt-3">
                        {(car.fitur && car.fitur.length > 0 ? car.fitur : ['AC Dual Zone', 'Audio Premium', 'Kamera Mundur', 'GPS Navigation', 'Bluetooth', 'USB Port', 'Kursi Kulit', 'Sunroof']).map((feature, i) => (
                          <div
                            key={i}
                            className="col-md-6 mb-3 car-detail-feature-item"
                            data-aos="fade-up"
                            data-aos-delay={200 + (i * 50)}
                          >
                            <div className="d-flex align-items-center">
                              <i className="fas fa-check me-2"></i>
                              <span>{feature}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div>
                    <h5 className="fw-bold mb-4">Spesifikasi Teknis</h5>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">Tipe Mesin</h6>
                          <p className="fw-bold">{car.tipe_mesin || "2.0L Turbocharged"}</p>
                        </div>
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">Transmisi</h6>
                          <p className="fw-bold">{car.transmisi || "Automatic 8-Speed"}</p>
                        </div>
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">Tenaga</h6>
                          <p className="fw-bold">{car.tenaga || "250 HP @ 5,500 RPM"}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">Kapasitas Penumpang</h6>
                          <p className="fw-bold">{car.kapasitas || "5 Orang"}</p>
                        </div>
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">Bahan Bakar</h6>
                          <p className="fw-bold">{car.bahan_bakar || "Bensin"}</p>
                        </div>
                        <div className="mb-3">
                          <h6 className="text-muted mb-2">Konsumsi BBM</h6>
                          <p className="fw-bold">{car.konsumsi_bbm || "12 km/L"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h5 className="fw-bold mb-4">Ulasan Pelanggan</h5>
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <span className="fw-bold me-2">Budi Santoso</span>
                          <div className="d-inline-block">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fas fa-star ${i < 4 ? 'text-warning' : 'text-secondary'}`}></i>
                            ))}
                          </div>
                        </div>
                        <small className="text-muted">2 minggu yang lalu</small>
                      </div>
                      <p className="mb-0">Mobil sangat nyaman dan bersih. Pelayanan penyewaan juga sangat profesional. Akan sewa lagi di masa depan.</p>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div>
                          <span className="fw-bold me-2">Anita Rahayu</span>
                          <div className="d-inline-block">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fas fa-star ${i < 5 ? 'text-warning' : 'text-secondary'}`}></i>
                            ))}
                          </div>
                        </div>
                        <small className="text-muted">1 bulan yang lalu</small>
                      </div>
                      <p className="mb-0">Pengalaman menyewa yang menyenangkan. Mobil dalam kondisi sangat baik dan performa mesin sangat halus.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="col-lg-5">
            <div className="car-detail-booking-card" data-aos="fade-left">
              <div className="car-detail-booking-header">
                <h4 className="mb-0 fw-bold car-detail-booking-title">
                  <i className="fas fa-calendar-alt me-2"></i> Formulir Penyewaan
                </h4>
              </div>
              <div className="car-detail-booking-body">
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="flex-shrink-0">
                      <img
                        src={car.gambar ? (car.gambar.startsWith("http") ? car.gambar : BACKEND_URL + car.gambar) : defaultCarImage}
                        alt="Car Thumbnail"
                        className="rounded-3"
                        style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                        onError={(e) => handleImageError(e.target, defaultCarImage)}
                      />
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-0 fw-bold">{car.nama}</h6>
                      <small className="text-muted">{car.kategori || 'Standard'}</small>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3 car-detail-price-per-day" data-aos="fade-up">
                  <span className="text-muted">Harga per hari:</span>
                  <span className="fw-bold">Rp {harga.toLocaleString('id-ID')}</span>
                </div>

                <div className="mb-4 car-detail-duration" data-aos="fade-up" data-aos-delay="100">
                  <label className="form-label fw-bold">Durasi Sewa (hari):</label>
                  <div className="input-group">
                    <button
                      className="btn btn-outline-secondary car-detail-duration-decrease"
                      onClick={() => setDays(Math.max(1, days - 1))}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input
                      type="number"
                      className="form-control text-center car-detail-duration-input"
                      min="1"
                      value={days}
                      onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                    />
                    <button
                      className="btn btn-outline-secondary car-detail-duration-increase"
                      onClick={() => setDays(days + 1)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </div>

                {diskon > 0 && (
                  <div className="alert alert-success py-2 mb-3 car-detail-discount" data-aos="zoom-in" data-aos-delay="150">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        <i className="fas fa-percentage me-2"></i> Diskon {diskon}%
                      </span>
                      <span className="fw-bold">- Rp {(totalPrice * diskon / 100).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                )}

                <div className="bg-light p-3 rounded-3 mb-4 car-detail-total-price" data-aos="fade-up" data-aos-delay="200">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0 fw-bold">Total Harga:</h5>
                    <h3 className="mb-0 text-success fw-bold">
                      Rp {discountedPrice.toLocaleString('id-ID')}
                    </h3>
                  </div>
                  <div className="d-flex justify-content-between small text-muted">
                    <span>Termasuk pajak</span>
                    <span>Asuransi termasuk</span>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg w-100 py-3 fw-bold mb-3 car-detail-book-now"
                  onClick={handleBooking}
                  data-aos="zoom-in"
                  data-aos-delay="250"
                >
                  <i className="fas fa-calendar-check me-2"></i> Pesan Sekarang
                </button>

                <div className="text-center car-detail-payment-info">
                  <div className="d-flex justify-content-center mb-2">
                    {['visa', 'mastercard', 'paypal'].map((method, i) => (
                      <div key={i} className="mx-2">
                        <i className={`fab fa-cc-${method} fa-2x text-muted`}></i>
                      </div>
                    ))}
                  </div>
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

export default DetailMobil;