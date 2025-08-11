import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Spinner,
  Alert,
  Badge,
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  FaCar,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaInfoCircle,
  FaTimes,
  FaStar,
  FaCogs,
  FaUsers,
  FaTag,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCarSide,
  FaCreditCard,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "../style/UserOrdersPage.css";
import AOS from "aos";
import "aos/dist/aos.css";
import { API_URL } from "../utils/api";

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null); // Tambahkan ini!
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800, once: true, easing: "ease-out-cubic" });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.data || []);
      } catch (err) {
        setError("Gagal memuat daftar pesanan.");
        toast.error("Gagal memuat daftar pesanan.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      // fetchOrders() sama seperti di useEffect utama
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return { variant: "warning", icon: <FaClock className="me-1" />, text: "Menunggu" };
      case "confirmed":
        return { variant: "primary", icon: <FaCheckCircle className="me-1" />, text: "Dikonfirmasi" };
      case "completed":
        return { variant: "success", icon: <FaCheckCircle className="me-1" />, text: "Selesai" };
      case "cancelled":
        return { variant: "danger", icon: <FaExclamationTriangle className="me-1" />, text: "Dibatalkan" };
      default:
        return { variant: "secondary", icon: null, text: status };
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "unpaid":
        return { variant: "secondary", icon: <FaClock className="me-1" />, text: "Belum Bayar" };
      case "paid":
        return { variant: "success", icon: <FaCheckCircle className="me-1" />, text: "Lunas" };
      case "pending_verification":
        return { variant: "warning", icon: <FaClock className="me-1" />, text: "Verifikasi" };
      case "rejected":
        return { variant: "danger", icon: <FaExclamationTriangle className="me-1" />, text: "Ditolak" };
      case "refunded":
        return { variant: "info", icon: <FaMoneyBillWave className="me-1" />, text: "Dikembalikan" };
      default:
        return { variant: "secondary", icon: null, text: status };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Yakin ingin membatalkan pesanan ini?")) return;
    try {
      const token = localStorage.getItem("token");
      setCancellingId(orderId);
      await axios.put(
        `${API_URL}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Pesanan berhasil dibatalkan!", {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
        icon: "✅"
      });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: "cancelled", payment_status: "refunded" }
            : order
        )
      );
    } catch (err) {
      toast.error("Gagal membatalkan pesanan.", {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
        icon: "❌"
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleMidtransPayment = async (order) => {
    try {
      const token = localStorage.getItem("token");
      let orderId = order.midtrans_order_id;
      if (!orderId) {
        orderId = `ORDER-${order.id}-${Date.now()}`;
        // Simpan ke backend jika perlu
      }
      const res = await axios.post(
        `${API_URL}/payment/midtrans-token`,
        {
          order_id: orderId,
          gross_amount: order.total_price,
          layanan_id: order.car?.id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const snapToken = res.data.token;
      window.snap.pay(snapToken, {
        onSuccess: function(result) {
          toast.success("Pembayaran berhasil!", {
            position: "top-right",
            autoClose: 2500,
            theme: "colored",
            icon: "✅"
          });
          window.location.reload();
        },
        onPending: function(result) {
          toast.info("Pembayaran masih diproses.", {
            position: "top-right",
            autoClose: 3500,
            theme: "colored",
            icon: "⏳"
          });
        },
        onError: function(result) {
          toast.error("Pembayaran gagal.", {
            position: "top-right",
            autoClose: 3500,
            theme: "colored",
            icon: "❌"
          });
        },
        onClose: function() {
          toast.info("Anda menutup popup pembayaran sebelum menyelesaikan transaksi.", {
            position: "top-right",
            autoClose: 3500,
            theme: "colored",
            icon: "ℹ️"
          });
        }
      });
    } catch (err) {
      toast.error("Gagal memproses pembayaran.", {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
        icon: "❌"
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return ["pending", "confirmed"].includes(order.status);
    return order.status === activeFilter;
  });

  const getOrderProgress = (order) => {
    if (order.status === "completed") return 100;
    if (order.status === "cancelled") return 0;
    
    const steps = ["pending", "confirmed"];
    const currentStep = steps.indexOf(order.status);
    return ((currentStep + 1) / steps.length) * 100;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" role="status" />
        <p className="mt-3 text-muted">Memuat daftar pesanan Anda...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <FaInfoCircle className="me-2" />
          {error}
          <div className="mt-3">
            <Button
              variant="outline-danger"
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!orders.length) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="empty-state">
            <FaCarSide className="empty-icon" />
            <h3 className="mt-3">Belum Ada Pesanan</h3>
            <p className="text-muted">Anda belum memiliki pesanan mobil. Mulai pesan sekarang!</p>
            <Button
              variant="primary"
              onClick={() => navigate("/layanan")}
              className="mt-3"
            >
              <FaCar className="me-2" />
              Pesan Mobil Sekarang
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <div className="user-orders-root bg-light" style={{ minHeight: "100vh" }}>
      {/* HERO SECTION */}
      <section className="user-orders-hero position-relative d-flex align-items-center">
        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row align-items-center">
            <div className="col-lg-7 text-center text-lg-start" data-aos="fade-right">
              <h1 className="display-4 fw-bold mb-3">
                <FaCalendarAlt className="me-2" />
                Pesanan Anda
              </h1>
              <p className="lead mb-4" style={{ maxWidth: 520 }}>
                Lihat riwayat dan status pesanan rental mobil Anda. Kelola bukti pembayaran, cek promo, dan nikmati layanan terbaik dari kami.
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <Button
                  variant="light"
                  className="fw-bold px-4 py-2 rounded-pill"
                  onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
                >
                  <FaCar className="me-2" />
                  Lihat Pesanan
                </Button>
                <Button
                  variant="outline-light"
                  className="fw-bold px-4 py-2 rounded-pill"
                  onClick={() => navigate("/layanan")}
                >
                  <FaCarSide className="me-2" />
                  Pesan Mobil Baru
                </Button>
              </div>
            </div>
            <div className="col-lg-5 text-center mt-5 mt-lg-0 position-relative" data-aos="fade-left">
              <img
                src="/images/Home.png"
                alt="Pesanan Rental Mobil"
                className="img-fluid rounded-4 shadow-lg"
                style={{ maxWidth: "90%", minWidth: 260 }}
                width={420}
                height={220}
                loading="eager"
              />
              <div
                className="promo-badge-inline"
                style={{
                  position: "absolute",
                  top: 30,
                  right: 30,
                  fontSize: "1rem",
                  zIndex: 2,
                }}
              >
                <FaTag className="me-2" />
                Cek Promo Aktif!
              </div>
            </div>
          </div>
        </div>
        <div className="user-orders-hero-overlay" style={{ zIndex: 1 }} />
      </section>

      <Container className="py-4 user-orders-container">
        <div className="page-header mb-4" data-aos="fade-down">
          <h2 className="page-title">
            <FaCalendarAlt className="me-2" />
            Daftar Pesanan Anda
          </h2>
          <p className="page-subtitle text-muted">
            Lihat dan kelola semua pesanan rental mobil Anda
          </p>
        </div>

        <div className="filters mb-4" data-aos="fade-up">
          <Button
            variant={activeFilter === "all" ? "primary" : "outline-secondary"}
            onClick={() => setActiveFilter("all")}
            className="me-2"
          >
            Semua
          </Button>
          <Button
            variant={activeFilter === "active" ? "primary" : "outline-secondary"}
            onClick={() => setActiveFilter("active")}
            className="me-2"
          >
            Aktif
          </Button>
          <Button
            variant={activeFilter === "pending" ? "primary" : "outline-secondary"}
            onClick={() => setActiveFilter("pending")}
            className="me-2"
          >
            Menunggu
          </Button>
          <Button
            variant={activeFilter === "confirmed" ? "primary" : "outline-secondary"}
            onClick={() => setActiveFilter("confirmed")}
            className="me-2"
          >
            Dikonfirmasi
          </Button>
          <Button
            variant={activeFilter === "completed" ? "primary" : "outline-secondary"}
            onClick={() => setActiveFilter("completed")}
          >
            Selesai
          </Button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-results text-center py-5" data-aos="fade-up">
            <FaInfoCircle className="text-muted mb-3" size={48} />
            <h5>Tidak ada pesanan yang sesuai dengan filter</h5>
            <Button
              variant="outline-primary"
              onClick={() => setActiveFilter("all")}
              className="mt-3"
            >
              Tampilkan Semua Pesanan
            </Button>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {filteredOrders.map((order, idx) => {
              const statusBadge = getStatusBadge(order.status);
              const paymentBadge = getPaymentStatusBadge(order.payment_status);

              return (
                <Col key={order.id} data-aos="zoom-in" data-aos-delay={idx * 80}>
                  <Card className="h-100 order-card">
                    <Card.Header className="order-header">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="order-id">ORDER #{order.id}</div>
                        <div className="order-date">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="status-badges mt-2">
                        <Badge bg={statusBadge.variant} className="me-2">
                          {statusBadge.icon}
                          {statusBadge.text}
                        </Badge>
                        <Badge bg={paymentBadge.variant}>
                          {paymentBadge.icon}
                          {paymentBadge.text}
                        </Badge>
                      </div>
                      <ProgressBar
                        now={getOrderProgress(order)}
                        variant={statusBadge.variant}
                        className="mt-2"
                        animated={order.status === "pending"}
                      />
                    </Card.Header>

                    <Card.Body>
                      <div className="car-info">
                        <div className="car-image-container">
                          <img
                            src={
                              order.car?.image_url?.startsWith("/")
                                ? `${API_URL.replace(/\/api$/, "")}${order.car.image_url}`
                                : order.car?.image_url
                            }
                            alt={order.car?.name}
                            className="car-image"
                          />
                          {order.car?.promo && order.car.promo > 0 && (
                            <div className="promo-badge">
                              <span>-{order.car.promo}%</span>
                            </div>
                          )}
                        </div>
                        <h5 className="car-name mt-3">
                          {order.car?.name || "Mobil Tidak Tersedia"}
                        </h5>
                        <div className="car-specs">
                          <div className="spec-item">
                            <FaCogs className="me-2" />
                            {order.car?.transmission || "-"}
                          </div>
                          <div className="spec-item">
                            <FaUsers className="me-2" />
                            {order.car?.capacity || "-"} Orang
                          </div>
                          <div className="spec-item">
                            <FaCogs className="me-2" />
                            Fitur:{" "}
                            {Array.isArray(order.car?.fitur) && order.car.fitur.length > 0
                              ? order.car.fitur.slice(0, 3).join(", ")
                              : "-"}
                          </div>
                          <div className="spec-item">
                            <FaStar className="text-warning me-2" />
                            {(typeof order.car?.rating === "number" && !isNaN(order.car.rating))
                              ? `${order.car.rating.toFixed(1)} (${order.car.jumlah_review || 0})`
                              : "Belum ada rating"}
                          </div>
                        </div>
                      </div>

                      <div className="order-details mt-3">
                        <div className="detail-section">
                          <h6>
                            <FaCalendarAlt className="me-2" />
                            Periode Sewa
                          </h6>
                          <div className="detail-content">
                            <div className="date-range">
                              <div className="date-item">
                                <span className="date-label">Ambil:</span>
                                <span className="date-value">{formatDate(order.pickup_date)}</span>
                              </div>
                              <div className="date-item">
                                <span className="date-label">Kembali:</span>
                                <span className="date-value">{formatDate(order.return_date)}</span>
                              </div>
                            </div>
                            <Badge bg="light" text="dark" className="duration-badge">
                              {order.duration} hari
                            </Badge>
                          </div>
                        </div>

                        <div className="detail-section">
                          <h6>
                            <FaMoneyBillWave className="me-2" />
                            Total Pembayaran
                          </h6>
                          <div className="detail-content">
                            <div className="price-info">
                              <div className="price-row total">
                                <span>Total:</span>
                                <span className="total-price">
                                  {formatCurrency(order.total_price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {order.additional_notes && (
                          <div className="detail-section">
                            <h6>
                              <FaInfoCircle className="me-2" />
                              Catatan Tambahan
                            </h6>
                            <div className="detail-content">
                              <div className="notes">
                                {order.additional_notes}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card.Body>

                    <Card.Footer className="text-center">
                      {order.status === "pending" && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="px-4 py-2 fw-bold rounded-pill"
                        >
                          {cancellingId === order.id ? (
                            <Spinner size="sm" animation="border" />
                          ) : (
                            <>
                              <FaTimes className="me-2" />
                              Batalkan Pesanan
                            </>
                          )}
                        </Button>
                      )}
                      {order.payment_status === "unpaid" && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleMidtransPayment(order)}
                          className="px-4 py-2 fw-bold rounded-pill"
                        >
                          <FaCreditCard className="me-2" />
                          Bayar Sekarang
                        </Button>
                      )}
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default UserOrdersPage;