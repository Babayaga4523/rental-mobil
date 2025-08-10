import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaCar, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaPercentage, 
  FaCreditCard, 
  FaArrowLeft, 
  FaTimesCircle 
} from "react-icons/fa";
import { format, addDays, isBefore } from "date-fns";
import AOS from "aos";
import "aos/dist/aos.css";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../style/BookingPage.css";
import axios from "axios";
  
const BACKEND_URL = "http://localhost:3000";

const getHargaSetelahPromo = (price, promo) => {
  if (promo && promo > 0) {
    return Math.round(price - (price * promo / 100));
  }
  return price;
};

const BANK_INFO = {
  bank: "BCA",
  norek: "3930338060",
  nama: "Agus Windiarto",
};

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
    payment_method: "midtrans", // default midtrans
    additional_notes: "",
    total_price: totalHarga,
    // payment_proof: null, // HAPUS
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [activeTab, setActiveTab] = useState("booking");
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Tambahkan state baru
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  // Tambahkan state ini
  const [bookedDates, setBookedDates] = useState([]);
  const [showAllBooked, setShowAllBooked] = useState(false);

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

  // Hapus validasi payment_proof di validateForm
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Silakan lengkapi formulir dengan benar.", {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
        icon: "⚠️"
      });
      return;
    }

    setIsLoading(true);
    setIsUploading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan", {
          position: "top-right",
          autoClose: 3500,
          theme: "colored",
          icon: "❌"
        });
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('layanan_id', Number(formData.layanan_id));
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

      toast.success("Pesanan berhasil dibuat! Detail pesanan akan dikirim ke email Anda.", {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
        icon: "✅"
      });

      const orderId = response.data?.data?.id;
      if (!orderId) {
        toast.error("Gagal mendapatkan ID pesanan dari server", {
          position: "top-right",
          autoClose: 3500,
          theme: "colored",
          icon: "❌"
        });
        return;
      }
      const responseReceipt = await axios.get(
        `${BACKEND_URL}/api/orders/${orderId}/receipt`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (responseReceipt.data?.data?.id) {
        navigate(`/orders/${responseReceipt.data.data.id}/receipt`);
      } else {
        toast.error("Gagal mendapatkan ID pesanan", {
          position: "top-right",
          autoClose: 3500,
          theme: "colored",
          icon: "❌"
        });
      }
    } catch (error) {
      let errorMessage = "Gagal membuat pesanan";
      if (error.response) {
        errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          errorMessage;
      } else if (error.request) {
        errorMessage = "Tidak ada respon dari server";
      } else {
        errorMessage = error.message;
      }
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
        icon: "❌"
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const orderData = {
        layanan_id: Number(formData.layanan_id),
        pickup_date: formData.pickup_date,
        return_date: formData.return_date,
        payment_method: formData.payment_method,
        additional_notes: formData.additional_notes,
        total_price: formData.total_price,
        // payment_proof: formData.payment_proof, // Uncomment if needed
      };

      const res = await axios.post("http://localhost:3000/api/orders", orderData, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data && res.data.success && res.data.data && res.data.data.id) {
        // Redirect ke halaman struk
        navigate(`/orders/${res.data.data.id}/receipt`);
      } else {
        // Tampilkan error
        toast.error("Gagal membuat pesanan. Silakan coba lagi.");
      }
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
    }
  };

  // Check availability on component mount and when carId changes
  useEffect(() => {
    if (!carId) return;
    
    const fetchBookedDates = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BACKEND_URL}/api/orders/layanan/${carId}/booked-dates`, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        if (res.data.success) {
          setBookedDates(res.data.bookedDates);
        }
      } catch (error) {
        console.error('Error fetching booked dates:', error);
        setBookedDates([]);
      }
    };

    fetchBookedDates();
  }, [carId]);

  const checkAvailability = async (pickup, returnDate) => {
    if (!pickup || !returnDate) {
      setIsAvailable(null);
      return;
    }
    setIsChecking(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders/check-availability`, {
        params: {
          layanan_id: carId,
          pickup_date: pickup,
          return_date: returnDate
        }
      });
      // Perbaikan: handle response tanpa field success
      if (typeof response.data.available === "boolean") {
        setIsAvailable(response.data.available);
        if (!response.data.available) {
          toast.error('Mobil tidak tersedia pada tanggal yang dipilih');
        }
      } else {
        setIsAvailable(null);
        toast.error('Gagal mengecek ketersediaan mobil');
      }
    } catch (error) {
      setIsAvailable(false);
      toast.error('Gagal mengecek ketersediaan mobil');
    } finally {
      setIsChecking(false);
    }
  };

  // Tambahkan useEffect untuk cek availability saat tanggal berubah
  useEffect(() => {
    if (formData.pickup_date && formData.return_date) {
      checkAvailability(formData.pickup_date, formData.return_date);
    }
  }, [formData.pickup_date, formData.return_date]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Fetch booked dates for the car
  useEffect(() => {
    if (!carId) return;
    axios
      .get(`${BACKEND_URL}/api/orders/layanan/${carId}/booked-dates`)
      .then((res) => setBookedDates(res.data.bookedDates || []))
      .catch(() => setBookedDates([]));
  }, [carId]);

  // Tambahkan fungsi handleMidtransPayment di dalam komponen Booking
  const handleMidtransPayment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Anda harus login terlebih dahulu.", {
          position: "top-right",
          autoClose: 3500,
          theme: "colored",
          icon: "⚠️"
        });
        return;
      }

      const order_id = `ORDER-${Date.now()}`;
      const gross_amount = formData.total_price;
      const layanan_id = Number(formData.layanan_id);

      // Dapatkan Snap token dari backend
      const res = await axios.post(
        `${BACKEND_URL}/api/payment/midtrans-token`,
        {
          order_id,
          gross_amount,
          layanan_id, // atau car_id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.token) {
        window.snap.pay(res.data.token, {
          onSuccess: async function(result) {
            toast.success("Pembayaran berhasil!", {
              position: "top-right",
              autoClose: 2500,
              theme: "colored",
              icon: "✅"
            });
            // Ambil payment_type dari Midtrans
            const paymentMethod = result.payment_type || "midtrans";
            // Buat order di backend dengan status paid
            const orderRes = await axios.post(
              `${BACKEND_URL}/api/orders`,
              {
                layanan_id: Number(formData.layanan_id),
                pickup_date: formData.pickup_date,
                return_date: formData.return_date,
                payment_method: paymentMethod,
                additional_notes: formData.additional_notes,
                total_price: formData.total_price,
                payment_status: "paid",
                midtrans_order_id: result.order_id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            // Redirect ke OrderReceipt tanpa delay
            if (orderRes.data?.data?.id) {
              navigate(`/orders/${orderRes.data.data.id}/receipt`);
            } else {
              toast.error("Gagal mendapatkan ID pesanan");
            }
          },
          onPending: async function(result) {
            toast.info("Pembayaran masih diproses.", {
              position: "top-right",
              autoClose: 3500,
              theme: "colored",
              icon: "⏳"
            });
            // Ambil payment_type dari Midtrans
            const paymentMethod = result.payment_type || "midtrans";
            // Buat order di backend dengan status pending
            const orderRes = await axios.post(
              `${BACKEND_URL}/api/orders`,
              {
                layanan_id: Number(formData.layanan_id),
                pickup_date: formData.pickup_date,
                return_date: formData.return_date,
                payment_method: paymentMethod,
                additional_notes: formData.additional_notes,
                total_price: formData.total_price,
                payment_status: "unpaid",
                midtrans_order_id: result.order_id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            // Redirect ke OrderReceipt tanpa delay
            if (orderRes.data?.data?.id) {
              navigate(`/orders/${orderRes.data.data.id}/receipt`);
            } else {
              toast.error("Gagal mendapatkan ID pesanan");
            }
          },
          onError: async function(result) {
            toast.error("Pembayaran gagal.", {
              position: "top-right",
              autoClose: 3500,
              theme: "colored",
              icon: "❌"
            });
            // Buat order di backend dengan status failed
            const paymentMethod = result?.payment_type || "midtrans";
            const orderRes = await axios.post(
              `${BACKEND_URL}/api/orders`,
              {
                layanan_id: Number(formData.layanan_id),
                pickup_date: formData.pickup_date,
                return_date: formData.return_date,
                payment_method: paymentMethod,
                additional_notes: formData.additional_notes,
                total_price: formData.total_price,
                payment_status: "failed",
                midtrans_order_id: result?.order_id,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (orderRes.data?.data?.id) {
              navigate(`/orders/${orderRes.data.data.id}/receipt`);
            } else {
              toast.error("Pembayaran gagal dan pesanan tidak tercatat.");
            }
          },
          onClose: function() {
            toast.info("Anda menutup popup pembayaran", {
              position: "top-right",
              autoClose: 3500,
              theme: "colored",
              icon: "ℹ️"
            });
          }
        });
      } else {
        toast.error("Gagal mendapatkan token pembayaran", {
          position: "top-right",
          autoClose: 3500,
          theme: "colored",
          icon: "❌"
        });
      }
    } catch (err) {
      toast.error("Gagal memulai pembayaran", {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
        icon: "❌"
      });
    }
  };

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
    <div className="booking-page-root" style={{ paddingTop: 100 }}>
      {/* CONTENT SECTION */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="booking-page-card border-0 shadow-sm" data-aos="fade-up">
              <div className="booking-page-card-header bg-primary text-white py-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <button className="btn btn-sm btn-outline-light me-3" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                  </button>
                  <h1 className="h4 mb-0 fw-bold">
                    <FaCar className="me-2" /> 
                    {activeTab === "booking" ? "Formulir Pemesanan" : "Pembayaran"}
                  </h1>
                </div>
                <span className="badge bg-gradient-primary fs-6 px-3 py-2 shadow-sm" style={{ background: "linear-gradient(90deg,#ffd700,#ffb300)", color: "#222" }}>
                  Premium Service
                </span>
              </div>
              <div className="booking-page-card-body p-4">
                <div className="row g-4">
                  {/* Summary Section */}
                  <div className="col-lg-5">
                    <div className="booking-page-summary card border-0 shadow-sm p-0" data-aos="zoom-in">
                      <div className="booking-page-card-img-top-custom position-relative">
                        <img
                          src={image ? (image.startsWith("http") ? image : BACKEND_URL + image) : "/images/default-car.jpg"}
                          alt={carName}
                          className="booking-page-img-cover-custom"
                        />
                        {discount > 0 && (
                          <span className="badge bg-warning text-dark position-absolute top-0 end-0 m-3 fs-6 shadow">Diskon {discount}%</span>
                        )}
                      </div>
                      <div className="card-body pb-3">
                        <h3 className="h5 fw-bold mb-3 text-gradient">{carName}</h3>
                        <ul className="list-unstyled mb-4">
                          <li className="mb-2 d-flex align-items-center">
                            <FaMoneyBillWave className="text-primary me-2 flex-shrink-0" />
                            <span>
                              Harga per hari: {discount > 0 ? (
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
                            <span>Durasi sewa: <strong>{days} hari</strong></span>
                          </li>
                        </ul>
                        <div className="border-top pt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <h4 className="h6 mb-0">Total Harga:</h4>
                            <h3 className="h5 mb-0 total-price-badge">
                              Rp {totalHarga?.toLocaleString("id-ID")}
                            </h3>
                          </div>
                          <small className="text-muted d-block mt-1">Termasuk pajak dan asuransi</small>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Form Section */}
                  <div className="col-lg-7">
                    {/* Info Ketersediaan */}
                    <div className="mb-4">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <h5 className="fw-bold mb-3">
                            <i className="fas fa-calendar-times text-warning me-2"></i>
                            Informasi Ketersediaan Mobil
                          </h5>
                          {bookedDates.length === 0 ? (
                            <div className="alert alert-success mb-0 d-flex align-items-center">
                              <i className="fas fa-check-circle me-2"></i>
                              Mobil tersedia untuk semua tanggal.
                            </div>
                          ) : (
                            <div className="alert alert-warning mb-0">
                              <div className="mb-2">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                <b>Mobil tidak tersedia pada tanggal berikut:</b>
                              </div>
                              <ul className="list-group list-group-flush">
                                {(showAllBooked ? bookedDates : bookedDates.slice(0, 3)).map((range, i) => (
                                  <li key={i} className="list-group-item bg-transparent px-0 py-1 border-0">
                                    <span className="badge bg-danger bg-opacity-75 me-2">
                                      {new Date(range.start).toLocaleDateString("id-ID")} - {new Date(range.end).toLocaleDateString("id-ID")}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              {bookedDates.length > 3 && (
                                <button
                                  className="btn btn-link p-0 mt-2"
                                  onClick={() => setShowAllBooked(!showAllBooked)}
                                >
                                  {showAllBooked ? "Sembunyikan" : `Lihat Semua (${bookedDates.length})`}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="card h-100 border-0 shadow-sm" data-aos="fade-left">
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
                                disabled={
                                  !formData.pickup_date ||
                                  !formData.return_date ||
                                  isChecking ||
                                  isAvailable === false // <-- tombol disabled jika mobil tidak tersedia
                                }
                              >
                                {isChecking ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Mengecek ketersediaan...
                                  </>
                                ) : isAvailable === false ? (
                                  "Mobil Tidak Tersedia"
                                ) : (
                                  "Lanjut ke Pembayaran"
                                )}
                              </button>
                              {isAvailable === false && (
                                <div className="alert alert-danger mt-3">
                                  <i className="fas fa-exclamation-circle me-2"></i>
                                  Mobil tidak tersedia pada tanggal yang dipilih. Silakan pilih tanggal lain.
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="mb-4">
                                <label className="form-label fw-bold d-block mb-3">
                                  Metode Pembayaran
                                </label>
                                <div className="alert alert-info d-flex align-items-center gap-2 mb-4">
                                  <FaCreditCard className="me-2" />
                                  Pembayaran hanya dapat dilakukan melalui Midtrans (Virtual Account).
                                </div>
                                {/* Tambahkan alert jika mobil tidak tersedia */}
                                {isAvailable === false && (
                                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
                                    <FaTimesCircle className="me-2" />
                                    Mobil tidak tersedia pada tanggal yang dipilih. Silahkan pilih mobil yang lain.
                                  </div>
                                )}
                              </div>
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
                                  type="button"
                                  className="btn btn-success flex-grow-1 py-3"
                                  onClick={handleMidtransPayment}
                                  disabled={isLoading || isAvailable === false}
                                >
                                  <FaCreditCard className="me-2" />
                                  Bayar Sekarang
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