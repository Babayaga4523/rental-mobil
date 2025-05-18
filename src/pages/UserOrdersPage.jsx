import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Container, Table, Spinner, Alert, Badge } from "react-bootstrap";
import { useAuth } from "../context/AuthContext"; // Sesuaikan path jika berbeda
import moment from "moment"; // Untuk format tanggal
import { toast } from "react-toastify"; // Untuk notifikasi

const API_URL = "http://localhost:3000/api"; // Sesuaikan jika API URL berbeda

const UserOrdersPage = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        // Jika tidak ada token, redirect ke login
        navigate("/login");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrders(res.data.data);
      } catch (err) {
        console.error("Error fetching user orders:", err);
        setError("Gagal memuat daftar pesanan.");
        toast.error("Gagal memuat daftar pesanan.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, navigate]); // Dependency array: jalankan ulang jika token atau navigate berubah

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  const getPaymentStatusBadgeColor = (status) => {
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
        return "info"; // Atau warna lain yang sesuai
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Memuat pesanan...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2>Daftar Pesanan Anda</h2>
      {orders.length === 0 ? (
        <Alert variant="info" className="mt-3">Anda belum memiliki pesanan.</Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>ID Pesanan</th>
              <th>Mobil</th>
              <th>Tanggal Sewa</th>
              <th>Durasi</th>
              <th>Total Harga</th>
              <th>Status Pesanan</th>
              <th>Status Pembayaran</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.mobil?.nama || order.car?.nama || '-'}</td> {/* Sesuaikan nama properti mobil */}
                <td>
                  {moment(order.tanggal.pickup).format("D MMM YYYY")} -{" "}
                  {moment(order.tanggal.return).format("D MMM YYYY")}
                </td>
                 <td>{order.durasi} hari</td>
                <td>Rp{(order.total_price || 0).toLocaleString("id-ID")}</td>
                <td>
                  <Badge bg={getStatusBadgeColor(order.status)}>
                    {order.status || '-'}
                  </Badge>
                </td>
                 <td>
                  <Badge bg={getPaymentStatusBadgeColor(order.pembayaran?.status || order.payment_status)}>
                    {order.pembayaran?.status || order.payment_status || '-'}
                  </Badge>
                </td>
                <td>
                  {/* Link ke halaman detail pesanan */}
                  <Link to={`/pesanan/${order.id}`} className="btn btn-sm btn-primary">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default UserOrdersPage;
