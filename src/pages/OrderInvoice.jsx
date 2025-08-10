import React, { useEffect, useState } from "react";
import axios from "axios";
import { Spinner, Alert, Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";

const BACKEND_URL = "https://uji-coba-production.up.railway.app";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { day: "numeric", month: "long", year: "numeric" };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const OrderInvoice = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${BACKEND_URL}/api/orders/${id}/receipt`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrder(res.data.data);
      } catch (err) {
        setError("Gagal memuat invoice.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <div className="text-center py-5"><Spinner /></div>;
  if (error) return <Alert variant="danger" className="my-5">{error}</Alert>;
  if (!order) return null;

  // Ambil data mobil (car/layanan) dan user
  const car = order.car || order.layanan || {};
  const user = order.user || {};
  const phone = user.phone || user.no_telp || "-";
  const pricePerDay = car.price_per_day || car.harga || 0;

  return (
    <div className="container py-4" style={{ maxWidth: 700 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="light" onClick={() => navigate(-1)}>
          <FaArrowLeft className="me-2" /> Kembali
        </Button>
        <Button variant="primary" onClick={() => window.print()}>
          <FaPrint className="me-2" /> Cetak/Download
        </Button>
      </div>
      <div className="border rounded p-4 bg-white shadow-sm" id="invoice-area">
        <h3 className="mb-3">INVOICE SEWA MOBIL</h3>
        <div className="mb-2"><b>No. Order:</b> #{order.id}</div>
        <div className="mb-2"><b>Tanggal Order:</b> {formatDate(order.created_at || order.order_date)}</div>
        <hr />
        <div className="mb-2"><b>Nama:</b> {user.name}</div>
        <div className="mb-2"><b>Email:</b> {user.email || "-"}</div>
        <div className="mb-2"><b>No. HP:</b> {phone}</div>
        <hr />
        <div className="mb-2"><b>Mobil:</b> {car.nama || car.name || "-"}</div>
        <div className="mb-2"><b>Periode Sewa:</b> {formatDate(order.pickup_date)} - {formatDate(order.return_date)}</div>
        <div className="mb-2"><b>Durasi:</b> {order.duration} hari</div>
        <div className="mb-2"><b>Harga per Hari:</b> {formatCurrency(pricePerDay)}</div>
        <div className="mb-2"><b>Total:</b> <b>{formatCurrency(order.total_price)}</b></div>
        <div className="mb-2"><b>Metode Pembayaran:</b> {order.payment_method || "-"}</div>
        <div className="mb-2"><b>Status Pembayaran:</b> {order.payment_status}</div>
        <div className="mb-2"><b>Status Pesanan:</b> {order.status}</div>
        {order.additional_notes && (
          <div className="mb-2"><b>Catatan:</b> {order.additional_notes}</div>
        )}
        <hr />
        <div className="text-end mt-4">
          <small>Terima kasih telah menggunakan layanan kami.</small>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;