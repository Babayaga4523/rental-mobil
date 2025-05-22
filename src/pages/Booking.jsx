import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaCar, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaPercentage,
  FaCreditCard,
  FaUniversity,
  FaMoneyCheckAlt,
  FaQrcode,
  FaArrowLeft,
  FaFileAlt,
  FaUpload,
  FaTimesCircle,
  FaCheckCircle
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import { format, addDays, isBefore } from "date-fns";
import PropTypes from "prop-types";
import "../style/BookingPage.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { QRCodeSVG } from "qrcode.react";
  
const BACKEND_URL = "http://localhost:3000";

const getHargaSetelahPromo = (price, promo) => {
  if (promo && promo > 0) {
    return Math.round(price - (price * promo / 100));
  }
  return price;
};

const BANK_INFO = {
  bank: "BCA",
  norek: "123 456 7890",
  nama: "Rental Mobil Jaya",
};
const EWALLET_INFO = [
  { label: "Gopay", nomor: "0812 3456 7890" },
  { label: "OVO", nomor: "0812 3456 7890" },
  { label: "Dana", nomor: "0812 3456 7890" },
];

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  toast.success("Berhasil disalin!");
};

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    carId,
    carName,
    price,
    discount,
    image,
    kapasitas,
    transmisi,
    fitur,
    days = 1,
  } = location.state || {};

  const hargaPromo = getHargaSetelahPromo(price, discount);
  const totalHarga = hargaPromo * days;

  const [formData, setFormData] = useState({
    layanan_id: carId,
    pickup_date: "",
    return_date: "",
    payment_method: "bank_transfer",
    additional_notes: "",
    total_price: totalHarga,
    payment_proof: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [activeTab, setActiveTab] = useState("booking");
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Check if token is valid on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("token_expiry");

    if (!token || Date.now() > tokenExpiry) {
      setIsSessionExpired(true);
      toast.error("Session expired. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (formData.pickup_date && days) {
      const pickupDate = new Date(formData.pickup_date);
      const returnDate = addDays(pickupDate, days);
      setFormData((prev) => ({
        ...prev,
        return_date: format(returnDate, "yyyy-MM-dd"),
      }));
    }
  }, [formData.pickup_date, days]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, or PDF files are allowed");
      return;
    }

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }

    setFormData((prevData) => ({
      ...prevData,
      payment_proof: file,
    }));
  };

  const removePaymentProof = () => {
    setFormData((prevData) => ({
      ...prevData,
      payment_proof: null,
    }));
    setPreviewImage(null);
  };

  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.pickup_date) {
      newErrors.pickup_date = "Pickup date is required";
    } else if (isBefore(new Date(formData.pickup_date), today)) {
      newErrors.pickup_date = "Pickup date cannot be in the past";
    }

    if (!formData.return_date) {
      newErrors.return_date = "Return date is required";
    } else if (isBefore(new Date(formData.return_date), new Date(formData.pickup_date))) {
      newErrors.return_date = "Return date must be after pickup date";
    }

    if (!formData.payment_method) {
      newErrors.payment_method = "Payment method is required";
    }

    if (!formData.payment_proof && formData.payment_method !== "credit_card") {
      newErrors.payment_proof = "Payment proof is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill the form correctly");
      return;
    }

    setIsLoading(true);
    setIsUploading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formDataToSend = new FormData();
      formDataToSend.append('layanan_id', Number(formData.layanan_id)); // pastikan integer
      formDataToSend.append('pickup_date', formData.pickup_date);
      formDataToSend.append('return_date', formData.return_date);
      formDataToSend.append('payment_method', formData.payment_method);
      formDataToSend.append('additional_notes', formData.additional_notes);
      formDataToSend.append('total_price', formData.total_price);
      if (formData.payment_proof) {
        formDataToSend.append('payment_proof', formData.payment_proof);
      }

      const response = await axios.post(
        "http://localhost:3000/api/orders",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },  
        }
      );
      console.log(response.data); // Debugging: log response untuk memastikan data dikirim dengan benar

      // Ambil orderId dari response backend
      const orderId = response.data?.data?.id 
      if (!orderId) {
        toast.error("Gagal mendapatkan ID pesanan dari server");
        return;
      }
      navigate(`/orders/${orderId}/receipt`);
    } catch (error) {
      console.error("Order creation error:", error);
      let errorMessage = "Failed to create order";
      if (error.response) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          errorMessage;
      } else if (error.request) {
        errorMessage = "No response from server";
      } else {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  if (isSessionExpired) {
    return null;
  }

  if (!carId) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="card shadow-sm" style={{ maxWidth: "500px" }}>
          <div className="card-body text-center p-5">
            <FaCar className="text-danger mb-4" style={{ fontSize: "4rem" }} />
            <h2 className="fw-bold mb-3">Mobil Tidak Ditemukan</h2>
            <p className="lead mb-4">
              Silakan kembali ke halaman pencarian mobil untuk memilih kendaraan
            </p>
            <button
              onClick={() => navigate("/layanan")}
              className="btn btn-primary px-4 py-2"
            >
              Kembali ke Daftar Mobil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page-root bg-light">
      {/* HERO SECTION */}
      <section className="booking-hero-section position-relative d-flex align-items-center justify-content-center">
        <div className="booking-hero-overlay"></div>
        <div className="container position-relative z-2 text-center">
          <h1
            className="display-4 fw-bold mb-3 booking-hero-title"
            data-aos="fade-down"
          >
            <span className="booking-hero-gradient-text">
              Booking Mobil Mudah & Cepat
            </span>
          </h1>
          <p
            className="lead text-white-50 mb-4 booking-hero-subtitle"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Isi formulir pemesanan di bawah ini untuk pengalaman rental mobil terbaik bersama kami.<br />
            Proses mudah, aman, dan transparan. Armada siap antar ke mana saja!
          </p>
          <div className="d-flex justify-content-center gap-3" data-aos="fade-up" data-aos-delay="200">
            <button
              className="btn btn-primary btn-lg rounded-pill px-4 py-3 shadow"
              onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
            >
              <FaCar className="me-2" />
              Mulai Booking
            </button>
            <a
              href="https://wa.me/6281381339149"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light btn-lg rounded-pill px-4 py-3"
            >
              <FaFileAlt className="me-2" />
              Chat Admin
            </a>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="booking-page-card border-0 shadow-sm">
              <div className="booking-page-card-header bg-primary text-white py-3">
                <div className="d-flex align-items-center">
                  <button 
                    className="btn btn-sm btn-outline-light me-3"
                    onClick={() => navigate(-1)}
                  >
                    <FaArrowLeft />
                  </button>
                  <h1 className="h4 mb-0 fw-bold">
                    <FaCar className="me-2" /> 
                    {activeTab === "booking" ? "Formulir Pemesanan" : "Pembayaran"}
                  </h1>
                </div>
              </div>

              <div className="booking-page-card-body p-4">
                <div className="row g-4">
                  {/* Summary Section */}
                  <div className="col-lg-5">
                    <div className="booking-page-summary card border-0 shadow-sm p-0">
                      <div className="booking-page-card-img-top-custom">
                        <img
                          src={
                            image
                              ? image.startsWith("http")
                                ? image
                                : BACKEND_URL + image
                              : "/images/default-car.jpg"
                          }
                          alt={carName}
                          className="booking-page-img-cover-custom"
                        />
                      </div>
                      <div className="card-body pb-3">
                        <h3 className="h5 fw-bold mb-3">{carName}</h3>
                        <ul className="list-unstyled mb-4">
                          <li className="mb-2 d-flex align-items-center">
                            <FaMoneyBillWave className="text-primary me-2 flex-shrink-0" />
                            <span>
                              Harga per hari:{" "}
                              {discount > 0 ? (
                                <>
                                  <span style={{ textDecoration: "line-through", color: "#bbb", marginRight: 6 }}>
                                    Rp {price?.toLocaleString("id-ID")}
                                  </span>
                                  <span className="fw-bold text-warning">
                                    Rp {hargaPromo?.toLocaleString("id-ID")}
                                  </span>
                                </>
                              ) : (
                                <strong>Rp {price?.toLocaleString("id-ID")}</strong>
                              )}
                            </span>
                          </li>
                          <li className="mb-2 d-flex align-items-center">
                            <FaCalendarAlt className="text-primary me-2 flex-shrink-0" />
                            <span>
                              Durasi sewa: <strong>{days} hari</strong>
                            </span>
                          </li>
                          {discount > 0 && (
                            <li className="mb-2 d-flex align-items-center">
                              <FaPercentage className="text-success me-2 flex-shrink-0" />
                              <span>
                                Diskon: <strong className="text-success">{discount}%</strong>
                              </span>
                            </li>
                          )}
                        </ul>
                        <div className="border-top pt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h4 className="h6 mb-0">Total Harga:</h4>
                            <h3 className="h5 mb-0 total-price-badge">
                              Rp {totalHarga?.toLocaleString("id-ID")}
                            </h3>
                          </div>
                          <small className="text-muted d-block mt-1">
                            Termasuk pajak dan asuransi
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="col-lg-7">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body">
                        <div className="booking-step-indicator mb-4">
                          <div className={`step ${activeTab === "booking" ? "active" : ""}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Pemesanan</span>
                          </div>
                          <div className="step-divider" />
                          <div className={`step ${activeTab === "payment" ? "active" : ""}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">Pembayaran</span>
                          </div>
                        </div>

                        <ul className="nav nav-tabs mb-4">
                          <li className="nav-item">
                            <button
                              className={`nav-link ${activeTab === "booking" ? "active" : ""}`}
                              onClick={() => setActiveTab("booking")}
                            >
                              <FaCalendarAlt className="me-2" />
                              Detail Pemesanan
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              className={`nav-link ${activeTab === "payment" ? "active" : ""}`}
                              onClick={() => setActiveTab("payment")}
                              disabled={!formData.pickup_date || !formData.return_date}
                            >
                              <FaCreditCard className="me-2" />
                              Pembayaran
                            </button>
                          </li>
                        </ul>

                        <form onSubmit={handleSubmit} noValidate>
                          {activeTab === "booking" ? (
                            <>
                              <div className="mb-3">
                                <label htmlFor="pickup_date" className="form-label fw-bold">
                                  <FaCalendarAlt className="me-2 text-muted" />
                                  Tanggal Pengambilan
                                </label>
                                <input
                                  type="date"
                                  id="pickup_date"
                                  name="pickup_date"
                                  className={`form-control ${errors.pickup_date ? "is-invalid" : ""}`}
                                  value={formData.pickup_date}
                                  onChange={handleChange}
                                  min={format(new Date(), "yyyy-MM-dd")}
                                  required
                                />
                                {errors.pickup_date && (
                                  <div className="invalid-feedback">{errors.pickup_date}</div>
                                )}
                              </div>

                              <div className="mb-4">
                                <label htmlFor="return_date" className="form-label fw-bold">
                                  <FaCalendarAlt className="me-2 text-muted" />
                                  Tanggal Pengembalian
                                </label>
                                <input
                                  type="date"
                                  id="return_date"
                                  name="return_date"
                                  className="form-control"
                                  value={formData.return_date}
                                  readOnly
                                  required
                                />
                                <small className="text-muted">
                                  Diisi otomatis berdasarkan durasi sewa
                                </small>
                              </div>

                              <button
                                type="button"
                                className="btn btn-primary w-100 py-3"
                                onClick={() => setActiveTab("payment")}
                                disabled={!formData.pickup_date || !formData.return_date}
                              >
                                Lanjut ke Pembayaran
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="mb-4">
                                <label className="form-label fw-bold d-block mb-3">
                                  Metode Pembayaran
                                </label>
                                <div className="d-flex gap-3 flex-wrap">
                                  {[
                                    { value: "bank_transfer", label: "Transfer Bank", icon: FaUniversity },
                                    { value: "e_wallet", label: "E-Wallet", icon: FaMoneyCheckAlt },
                                  ].map((method) => {
                                    const Icon = method.icon;
                                    return (
                                      <button
                                        key={method.value}
                                        type="button"
                                        className={`btn payment-method-btn flex-grow-1 ${formData.payment_method === method.value ? "btn-primary active" : "btn-outline-primary"}`}
                                        onClick={() => handleChange({ target: { name: "payment_method", value: method.value } })}
                                      >
                                        <Icon className="me-2 fs-4" />
                                        {method.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* BANK TRANSFER */}
                              {formData.payment_method === "bank_transfer" && (
                                <div className="alert alert-info mt-3 d-flex flex-wrap align-items-center gap-4">
                                  <div>
                                    <div className="fw-bold mb-1">Transfer ke Rekening:</div>
                                    <div className="mb-1">
                                      <span className="me-1"><strong>Bank:</strong> {BANK_INFO.bank}</span>
                                    </div>
                                    <div className="mb-1">
                                      <span className="me-1"><strong>Nomor Rekening:</strong> {BANK_INFO.norek}</span>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary ms-1"
                                        onClick={() => copyToClipboard(BANK_INFO.norek)}
                                        title="Salin nomor rekening"
                                      >
                                        Salin
                                      </button>
                                    </div>
                                    <div className="mb-2">
                                      <span className="me-1"><strong>Atas Nama:</strong> {BANK_INFO.nama}</span>
                                    </div>
                                    <small className="text-muted">
                                      Cantumkan <b>ID pesanan</b> di keterangan transfer.
                                    </small>
                                  </div>
                                  <div className="qrcode-box text-center ms-auto">
                                    <QRCodeSVG
                                      value={BANK_INFO.norek}
                                      size={90}
                                      bgColor="#fff"
                                      fgColor="#1e3c72"
                                      level="H"
                                      className="qrcode-img"
                                    />
                                    <div className="small text-muted mt-2">QR Nomor Rekening</div>
                                  </div>
                                </div>
                              )}

                              {/* E-WALLET */}
                              {formData.payment_method === "e_wallet" && (
                                <div className="alert alert-info mt-3">
                                  <div className="row">
                                    {EWALLET_INFO.map((ew, idx) => (
                                      <div className="col-12 col-md-4 mb-3" key={ew.label}>
                                        <div className="ewallet-card p-3 h-100 d-flex flex-column align-items-center justify-content-center">
                                          <div className="fw-bold mb-1">{ew.label}</div>
                                          <div className="mb-1">
                                            <span>{ew.nomor}</span>
                                            <button
                                              type="button"
                                              className="btn btn-sm btn-outline-primary ms-2"
                                              onClick={() => copyToClipboard(ew.nomor)}
                                              title={`Salin nomor ${ew.label}`}
                                            >
                                              Salin
                                            </button>
                                          </div>
                                          <QRCodeSVG
                                            value={ew.nomor}
                                            size={70}
                                            bgColor="#fff"
                                            fgColor="#1e3c72"
                                            level="H"
                                            className="qrcode-img"
                                          />
                                          <div className="small text-muted mt-2">QR {ew.label}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <small className="text-muted">
                                    Cantumkan <b>ID pesanan</b> di keterangan transfer.
                                  </small>
                                </div>
                              )}

                              {/* Upload Bukti Pembayaran */}
                              <div className="mb-4">
                                <label className="form-label fw-bold d-block mb-3">
                                  Unggah Bukti Pembayaran
                                </label>
                                <div className="border rounded-3 p-3">
                                  {formData.payment_proof ? (
                                    <div className="position-relative">
                                      {previewImage ? (
                                        <img
                                          src={previewImage}
                                          alt="Preview bukti pembayaran"
                                          className="img-fluid rounded mb-3"
                                          style={{ maxHeight: "200px" }}
                                        />
                                      ) : (
                                        <div className="p-4 bg-light rounded text-center mb-3">
                                          <FaFileAlt className="fs-1 text-muted mb-2" />
                                          <p className="mb-0">{formData.payment_proof.name}</p>
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                        onClick={removePaymentProof}
                                        aria-label="Hapus bukti pembayaran"
                                      >
                                        <FaTimesCircle />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <label
                                        htmlFor="paymentProof"
                                        className="d-block cursor-pointer text-center p-4 border-2 border-dashed rounded"
                                      >
                                        <FaUpload className="fs-1 text-muted mb-3" />
                                        <p className="mb-1 fw-bold">Klik untuk mengunggah bukti pembayaran</p>
                                        <small className="text-muted">
                                          (Format: JPG, PNG, PDF, maksimal 5MB)
                                        </small>
                                      </label>
                                      <input
                                        type="file"
                                        id="paymentProof"
                                        className="d-none"
                                        onChange={handleFileChange}
                                        accept="image/jpeg,image/png,application/pdf"
                                      />
                                    </>
                                  )}
                                  {errors.payment_proof && (
                                    <div className="text-danger small mt-2">{errors.payment_proof}</div>
                                  )}
                                  {isUploading && (
                                    <div className="mt-3">
                                      <div className="progress">
                                        <div
                                          className="progress-bar progress-bar-striped progress-bar-animated"
                                          style={{ width: `${uploadProgress}%` }}
                                          aria-valuenow={uploadProgress}
                                          aria-valuemin="0"
                                          aria-valuemax="100"
                                        >
                                          {uploadProgress}%
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Notifikasi Otomatis */}
                              <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                                <FaCheckCircle className="me-2" />
                                Setelah pembayaran dan upload bukti, Anda akan menerima notifikasi otomatis via WhatsApp/email.
                              </div>

                              {/* Catatan Tambahan & Tombol */}
                              <div className="mb-4">
                                <label htmlFor="additional_notes" className="form-label fw-bold">
                                  Catatan Tambahan
                                </label>
                                <textarea
                                  id="additional_notes"
                                  name="additional_notes"
                                  className="form-control"
                                  rows="3"
                                  value={formData.additional_notes}
                                  onChange={handleChange}
                                  placeholder="Contoh: Alamat pengambilan, permintaan khusus, dll."
                                ></textarea>
                              </div>
                              <div className="d-flex gap-3">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary flex-grow-1 py-3"
                                  onClick={() => setActiveTab("booking")}
                                >
                                  Kembali
                                </button>
                                <button
                                  type="submit"
                                  className="btn btn-primary flex-grow-1 py-3"
                                  disabled={isLoading || isUploading}
                                >
                                  {isLoading || isUploading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                                      Memproses...
                                    </>
                                  ) : (
                                    <>
                                      <FaCheckCircle className="me-2" />
                                      Selesaikan Pemesanan
                                    </>
                                  )}
                                </button>
                              </div>
                            </>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>
                  {/* ...end col-lg-7 */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Booking.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      carId: PropTypes.string.isRequired,
      carName: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      days: PropTypes.number,
      totalPrice: PropTypes.number,
      image: PropTypes.string,
      discount: PropTypes.number,
    }),
  }),
};

export default Booking;