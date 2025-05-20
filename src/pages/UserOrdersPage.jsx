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
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { toast } from "react-toastify";
import {
  FaCar,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileAlt,
  FaInfoCircle,
  FaEye,
  FaTimes,
  FaStar,
  FaUser,
  FaCogs,
  FaUsers,
  FaTag,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import "../style/UserOrdersPage.css";

const BACKEND_URL = "http://localhost:3000";

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProof, setShowProof] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [proofType, setProofType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/orders`, {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "unpaid":
        return "secondary";
      case "paid":
        return "success";
      case "pending_verification":
        return "warning";
      case "rejected":
        return "danger";
      case "refunded":
        return "info";
      default:
        return "secondary";
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

  const getHargaSetelahPromo = (car) => {
    if (car.promo && car.promo > 0) {
      return Math.round(car.harga - (car.harga * car.promo / 100));
    }
    return car.harga;
  };

  // Modal Bukti Pembayaran
  const handleShowProof = (payment_proof) => {
    if (!payment_proof) return;
    const ext = payment_proof.split(".").pop().toLowerCase();
    setProofUrl(`${BACKEND_URL}${payment_proof}`);
    setProofType(ext);
    setShowProof(true);
  };

  const handleCloseProof = () => {
    setShowProof(false);
    setProofUrl("");
    setProofType("");
  };

  const renderPaymentProofButton = (payment_proof) => {
    if (!payment_proof)
      return <span className="text-muted">Belum diupload</span>;
    return (
      <OverlayTrigger
        placement="top"
        overlay={<Tooltip>Lihat Bukti Pembayaran</Tooltip>}
      >
        <Button
          variant="outline-primary"
          size="sm"
          className="d-flex align-items-center"
          onClick={() => handleShowProof(payment_proof)}
        >
          <FaEye className="me-2" />
          Bukti
        </Button>
      </OverlayTrigger>
    );
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
        <Alert variant="info" className="text-center">
          <FaInfoCircle className="me-2" />
          Anda belum memiliki pesanan.
          <div className="mt-3">
            <Button
              variant="primary"
              onClick={() => navigate("/layanan")}
            >
              Pesan Sekarang
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ paddingTop: 70 }}>
      <h2 className="mb-4 text-center text-primary">
        <FaCalendarAlt className="me-2" />
        Daftar Pesanan Anda
      </h2>

      <Row xs={1} md={2} lg={3} className="g-4">
        {orders.map((order) => (
          <Col key={order.id}>
            <Card className="h-100 shadow-sm order-card border-0">
              <Card.Header
                className={`bg-${getStatusBadge(
                  order.status
                )} bg-opacity-10 d-flex justify-content-between align-items-center`}
              >
                <div>
                  <Badge bg={getStatusBadge(order.status)} className="me-2">
                    {order.status === "pending" && "Menunggu"}
                    {order.status === "confirmed" && "Dikonfirmasi"}
                    {order.status === "completed" && "Selesai"}
                    {order.status === "cancelled" && "Dibatalkan"}
                  </Badge>
                  <Badge bg={getPaymentStatusBadge(order.payment_status)}>
                    {order.payment_status === "unpaid" && "Belum Bayar"}
                    {order.payment_status === "paid" && "Lunas"}
                    {order.payment_status === "pending_verification" &&
                      "Verifikasi"}
                    {order.payment_status === "rejected" && "Ditolak"}
                    {order.payment_status === "refunded" && "Dikembalikan"}
                  </Badge>
                </div>
                <small className="text-muted">ID: #{order.id}</small>
              </Card.Header>

              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div className="flex-shrink-0 me-3">
                    <img
                      src={
                        order.layanan?.gambar
                          ? order.layanan.gambar.startsWith("/")
                            ? `${BACKEND_URL}${order.layanan.gambar}`
                            : order.layanan.gambar
                          : "https://via.placeholder.com/80x60?text=No+Image"
                      }
                      alt={order.layanan?.nama}
                      className="car-thumbnail"
                    />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">
                      {order.layanan?.nama || "Mobil Tidak Tersedia"}
                    </h5>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="light" text="dark" className="border border-secondary">
                        <FaTag className="me-1" />
                        {order.layanan?.kategori || "-"}
                      </Badge>
                      <Badge bg="info" className="ms-1">
                        {order.layanan?.transmisi}
                      </Badge>
                      <Badge bg="secondary" className="ms-1">
                        <FaUsers className="me-1" />
                        {order.layanan?.kapasitas} Orang
                      </Badge>
                      {order.layanan?.promo > 0 && (
                        <Badge bg="danger" className="ms-1">
                          Promo {order.layanan.promo}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-muted">
                    <FaStar className="text-warning me-1" />
                    {order.layanan?.rating
                      ? `${order.layanan.rating.toFixed(1)} (${order.layanan.jumlah_review || 0} review)`
                      : "Belum ada rating"}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-muted">
                    <FaCogs className="me-1" />
                    Fitur:{" "}
                    {Array.isArray(order.layanan?.fitur) && order.layanan.fitur.length > 0
                      ? order.layanan.fitur.slice(0, 3).join(", ")
                      : "-"}
                  </span>
                </div>

                <hr />

                <div className="mb-3">
                  <h6 className="d-flex align-items-center">
                    <FaCalendarAlt className="me-2 text-primary" />
                    Periode Sewa
                  </h6>
                  <div className="ps-4">
                    <div>
                      <strong>Ambil:</strong> {formatDate(order.pickup_date)}
                    </div>
                    <div>
                      <strong>Kembali:</strong> {formatDate(order.return_date)}
                    </div>
                    <div className="mt-1">
                      <Badge bg="light" text="dark">
                        {order.duration} hari
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="d-flex align-items-center">
                    <FaMoneyBillWave className="me-2 text-success" />
                    Pembayaran
                  </h6>
                  <div className="ps-4">
                    <div>
                      <strong>Total:</strong> {formatCurrency(order.total_price)}
                    </div>
                    <div>
                      <span>
                        Harga per hari:{" "}
                        {order.layanan?.promo > 0 ? (
                          <>
                            <span style={{ textDecoration: "line-through", color: "#bbb", marginRight: 6 }}>
                              Rp {order.layanan.harga?.toLocaleString("id-ID")}
                            </span>
                            <span className="fw-bold text-warning">
                              Rp {getHargaSetelahPromo(order.layanan).toLocaleString("id-ID")}
                            </span>
                          </>
                        ) : (
                          <>Rp {order.layanan?.harga?.toLocaleString("id-ID")}</>
                        )}
                      </span>
                    </div>
                    <div className="mt-2">
                      <strong>Bukti:</strong> {renderPaymentProofButton(order.payment_proof)}
                    </div>
                  </div>
                </div>

                {order.additional_notes && (
                  <div className="mb-3">
                    <h6 className="d-flex align-items-center">
                      <FaInfoCircle className="me-2 text-info" />
                      Catatan
                    </h6>
                    <div className="ps-4">
                      <p className="text-muted mb-0">
                        {order.additional_notes}
                      </p>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal Bukti Pembayaran */}
      <Modal show={showProof} onHide={handleCloseProof} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFileAlt className="me-2" />
            Bukti Pembayaran
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {["jpg", "jpeg", "png", "webp"].includes(proofType) ? (
            <img
              src={proofUrl}
              alt="Bukti Pembayaran"
              style={{ maxWidth: "100%", maxHeight: 400, borderRadius: 8 }}
            />
          ) : proofType === "pdf" ? (
            <iframe
              src={proofUrl}
              title="Bukti Pembayaran PDF"
              style={{ width: "100%", height: 400, border: "none" }}
            />
          ) : proofUrl ? (
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary"
            >
              Download File
            </a>
          ) : (
            <span className="text-muted">Bukti pembayaran tidak tersedia.</span>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseProof}>
            <FaTimes className="me-1" />
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserOrdersPage;
