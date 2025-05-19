import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { Card, Table, Spinner, Badge, Alert } from "react-bootstrap";
import "./AdminDashboard.css";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import moment from "moment";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const API_URL = "http://localhost:3000/api";

const DashboardHome = () => {
  const [stats, setStats] = useState({ orders: 0, cars: 0, users: 0 });
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestCars, setLatestCars] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [carsLoading, setCarsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [latestOrdersChart, setLatestOrdersChart] = useState(null);
  const [latestUsersChart, setLatestUsersChart] = useState(null);
  const [notif, setNotif] = useState("");
  const token = localStorage.getItem("token");

  // Fetch statistik dan semua data utama
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setOrdersLoading(true);
      try {
        const [ordersRes, carsRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/orders/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/layanan`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const orders = Array.isArray(ordersRes.data.data) ? ordersRes.data.data : [];
        const cars = Array.isArray(carsRes.data.data) ? carsRes.data.data : [];
        const users = Array.isArray(usersRes.data.data)
          ? usersRes.data.data
          : (Array.isArray(usersRes.data.users) ? usersRes.data.users : []);

        setStats({
          orders: orders.length,
          cars: cars.length,
          users: users.length,
        });

        // Notifikasi: jumlah pesanan menunggu verifikasi
        const pendingVerif = orders.filter(o => o.payment_status === "pending_verification").length;
        setNotif(
          pendingVerif > 0
            ? `Ada ${pendingVerif} pesanan menunggu verifikasi pembayaran!`
            : ""
        );

        // Grafik pesanan per bulan
        const months = [
          "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
          "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
        ];
        const now = new Date();
        const year = now.getFullYear();
        const monthly = Array(12).fill(0);
        orders.forEach(order => {
          const created = order.createdAt || order.created_at || order.order_date;
          if (created) {
            const date = new Date(created);
            if (date.getFullYear() === year) {
              monthly[date.getMonth()] += 1;
            }
          }
        });
        setChartData({
          labels: months,
          datasets: [
            {
              label: `Pesanan ${year}`,
              data: monthly,
              backgroundColor: "#0d6efd",
            },
          ],
        });

        // 5 pesanan terbaru (urutkan dari terbaru)
        const sortedOrders = [...orders].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || a.order_date);
          const dateB = new Date(b.createdAt || b.created_at || b.order_date);
          return dateB - dateA;
        });
        const latest5Orders = sortedOrders.slice(0, 5);
        setLatestOrders(latest5Orders);

        // Grafik 5 pesanan terbaru (total harga)
        setLatestOrdersChart({
          labels: latest5Orders.map(order =>
            `${order.user?.name || "-"}`
          ),
          datasets: [
            {
              label: "Total Harga (Rp)",
              data: latest5Orders.map(order => Number(order.total_price) || 0),
              backgroundColor: [
                "#0d6efd", "#198754", "#ffc107", "#dc3545", "#6610f2"
              ],
              borderRadius: 8,
              maxBarThickness: 40,
            },
          ],
        });

        setOrdersLoading(false);
      } catch {
        setStats({ orders: 0, cars: 0, users: 0 });
        setNotif("");
        setChartData(null);
        setLatestOrders([]);
        setLatestOrdersChart(null);
        setOrdersLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  // Fetch 5 user terbaru
  useEffect(() => {
    const fetchLatestUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const users = Array.isArray(res.data.data)
          ? res.data.data
          : (Array.isArray(res.data.users) ? res.data.users : []);
        const latest5Users = users.slice(-5).reverse();
        setLatestUsers(latest5Users);

        // Grafik 5 user terbaru (tanggal daftar)
        setLatestUsersChart({
          labels: latest5Users.map(user => user.name),
          datasets: [
            {
              label: "Tanggal Daftar",
              data: latest5Users.map(user =>
                user.createdAt
                  ? moment(user.createdAt).valueOf()
                  : (user.created_at ? moment(user.created_at).valueOf() : 0)
              ),
              backgroundColor: [
                "#6610f2", "#0dcaf0", "#fd7e14", "#20c997", "#6f42c1"
              ],
              borderRadius: 8,
              maxBarThickness: 40,
            },
          ],
        });
      } catch {
        setLatestUsers([]);
        setLatestUsersChart(null);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchLatestUsers();
  }, [token]);

  // Fetch 5 mobil terbaru
  useEffect(() => {
    const fetchLatestCars = async () => {
      setCarsLoading(true);
      try {
        const res = await axios.get(`${API_URL}/layanan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const cars = Array.isArray(res.data.data)
          ? res.data.data
          : (Array.isArray(res.data) ? res.data : []);
        setLatestCars(cars.slice(-5).reverse());
      } catch {
        setLatestCars([]);
      } finally {
        setCarsLoading(false);
      }
    };
    fetchLatestCars();
  }, [token]);

  return (
    <div>
      {/* Notifikasi */}
      {notif && (
        <Alert variant="warning" className="mb-3">
          <Badge bg="warning" text="dark" className="me-2">!</Badge>
          {notif}
        </Alert>
      )}

      {/* Statistik Ringkasan */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <Card className="info-box">
            <div className="info-box-icon bg-primary">
              <i className="bi bi-file-earmark-text"></i>
            </div>
            <div className="info-box-content">
              <span className="info-box-text">Total Pesanan</span>
              <span className="info-box-number">{loading ? "..." : stats.orders}</span>
            </div>
          </Card>
        </div>
        <div className="col-md-4 mb-3">
          <Card className="info-box">
            <div className="info-box-icon bg-success">
              <i className="bi bi-car-front"></i>
            </div>
            <div className="info-box-content">
              <span className="info-box-text">Total Mobil</span>
              <span className="info-box-number">{loading ? "..." : stats.cars}</span>
            </div>
          </Card>
        </div>
        <div className="col-md-4 mb-3">
          <Card className="info-box">
            <div className="info-box-icon bg-info">
              <i className="bi bi-people"></i>
            </div>
            <div className="info-box-content">
              <span className="info-box-text">Total Pengguna</span>
              <span className="info-box-number">{loading ? "..." : stats.users}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 5 Pesanan Terbaru */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">5 Pesanan Terbaru</h5>
        </Card.Header>
        <Card.Body>
          {ordersLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : latestOrders.length === 0 ? (
            <Alert variant="info" className="mb-0">Belum ada pesanan.</Alert>
          ) : (
            <div className="table-responsive mb-0">
              <Table striped bordered hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Pelanggan</th>
                    <th>Mobil</th>
                    <th>Tanggal Sewa</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Pembayaran</th>
                  </tr>
                </thead>
                <tbody>
                  {latestOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.user?.name || "-"}</td>
                      <td>{order.layanan?.nama || "-"}</td>
                      <td>
                        {order.pickup_date
                          ? moment(order.pickup_date).format('D MMM YYYY')
                          : "-"}
                        {" - "}
                        {order.return_date
                          ? moment(order.return_date).format('D MMM YYYY')
                          : "-"}
                      </td>
                      <td>
                        Rp{(order.total_price || 0).toLocaleString('id-ID')}
                      </td>
                      <td>
                        <Badge pill bg={
                          order.status === "pending" ? "warning"
                            : order.status === "confirmed" ? "info"
                            : order.status === "completed" ? "primary"
                            : order.status === "cancelled" ? "danger"
                            : "secondary"
                        }>
                          {order.status || "-"}
                        </Badge>
                      </td>
                      <td>
                        <Badge pill bg={
                          order.payment_status === "paid"
                            ? "success"
                            : order.payment_status === "pending_verification"
                            ? "warning"
                            : order.payment_status === "rejected"
                            ? "danger"
                            : "secondary"
                        }>
                          {order.payment_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* 5 Pengguna Terbaru */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">5 Pengguna Terbaru</h5>
        </Card.Header>
        <Card.Body>
          {usersLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : latestUsers.length === 0 ? (
            <Alert variant="info" className="mb-0">Belum ada pengguna.</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Tanggal Daftar</th>
                  </tr>
                </thead>
                <tbody>
                  {latestUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        {user.createdAt
                          ? moment(user.createdAt).format("D MMM YYYY")
                          : user.created_at
                          ? moment(user.created_at).format("D MMM YYYY")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Mobil Terbaru */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">5 Mobil Terbaru</h5>
        </Card.Header>
        <Card.Body>
          {carsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="success" />
            </div>
          ) : latestCars.length === 0 ? (
            <Alert variant="info" className="mb-0">Belum ada mobil.</Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Nama Mobil</th>
                    <th>Jenis</th>
                    <th>Harga Sewa</th>
                  </tr>
                </thead>
                <tbody>
                  {latestCars.map(car => (
                    <tr key={car.id}>
                      <td>{car.nama}</td>
                      <td>{car.kategori || "-"}</td>
                      <td>Rp{(car.harga || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Fitur Menarik: Aktivitas Admin Terakhir */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Aktivitas Admin Terakhir</h5>
        </Card.Header>
        <Card.Body>
          <ul className="list-group">
            <li className="list-group-item">
              <i className="bi bi-person-check text-success me-2"></i>
              Login terakhir: <b>{moment().subtract(2, 'hours').format('D MMM YYYY, HH:mm')}</b>
            </li>
            <li className="list-group-item">
              <i className="bi bi-car-front-fill text-primary me-2"></i>
              Update data mobil: <b>{moment().subtract(1, 'days').format('D MMM YYYY')}</b>
            </li>
            <li className="list-group-item">
              <i className="bi bi-cash-coin text-warning me-2"></i>
              Verifikasi pembayaran: <b>{moment().subtract(3, 'hours').format('D MMM YYYY, HH:mm')}</b>
            </li>
            <li className="list-group-item">
              <i className="bi bi-person-plus text-info me-2"></i>
              Tambah pengguna baru: <b>{moment().subtract(2, 'days').format('D MMM YYYY')}</b>
            </li>
          </ul>
        </Card.Body>
      </Card>

      {/* Fitur Menarik: Quick Action */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Aksi Cepat</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex flex-wrap gap-3">
            <a href="/admin/orders" className="btn btn-primary">
              <i className="bi bi-file-earmark-plus me-2"></i> Kelola Pesanan
            </a>
            <a href="/admin/cars" className="btn btn-success">
              <i className="bi bi-car-front me-2"></i> Kelola Mobil
            </a>
            <a href="/admin/users" className="btn btn-info text-white">
              <i className="bi bi-people me-2"></i> Kelola Pengguna
            </a>
            <a href="/admin/profile" className="btn btn-secondary">
              <i className="bi bi-person-circle me-2"></i> Profil Admin
            </a>
          </div>
        </Card.Body>
      </Card>

      {/* Fitur Baru: Daftar Pesanan Belum Lunas */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Pesanan Belum Lunas</h5>
        </Card.Header>
        <Card.Body>
          {ordersLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="warning" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Pelanggan</th>
                    <th>Mobil</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Pembayaran</th>
                  </tr>
                </thead>
                <tbody>
                  {latestOrders.filter(order => order.payment_status !== "paid").length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">Semua pesanan sudah lunas.</td>
                    </tr>
                  ) : (
                    latestOrders
                      .filter(order => order.payment_status !== "paid")
                      .map(order => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{order.user?.name || "-"}</td>
                          <td>{order.layanan?.nama || "-"}</td>
                          <td>Rp{(order.total_price || 0).toLocaleString('id-ID')}</td>
                          <td>
                            <Badge pill bg={
                              order.status === "pending" ? "warning"
                                : order.status === "confirmed" ? "info"
                                : order.status === "completed" ? "primary"
                                : order.status === "cancelled" ? "danger"
                                : "secondary"
                            }>
                              {order.status || "-"}
                            </Badge>
                          </td>
                          <td>
                            <Badge pill bg={
                              order.payment_status === "paid"
                                ? "success"
                                : order.payment_status === "pending_verification"
                                ? "warning"
                                : order.payment_status === "rejected"
                                ? "danger"
                                : "secondary"
                            }>
                              {order.payment_status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Fitur Baru: Tips Admin */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Tips Admin Hari Ini</h5>
        </Card.Header>
        <Card.Body>
          <ul className="mb-0">
            <li>
              <i className="bi bi-lightbulb text-warning me-2"></i>
              Cek pesanan yang belum diverifikasi setiap hari untuk mempercepat proses pelanggan.
            </li>
            <li>
              <i className="bi bi-shield-check text-success me-2"></i>
              Pastikan data mobil selalu update agar pelanggan mendapatkan informasi terbaru.
            </li>
            <li>
              <i className="bi bi-chat-dots text-info me-2"></i>
              Tanggapi pertanyaan pelanggan dengan ramah dan cepat melalui WhatsApp atau telepon.
            </li>
            <li>
              <i className="bi bi-graph-up-arrow text-primary me-2"></i>
              Pantau statistik pesanan bulanan untuk evaluasi performa bisnis.
            </li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

const AdminDashboard = ({ darkMode, toggleDarkMode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const isDashboardHome = location.pathname === "/admin" || location.pathname === "/admin/";

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <AdminNavbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <AdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div className="content-wrapper" style={{
        marginLeft: sidebarCollapsed ? 60 : 230,
        transition: "margin-left 0.2s"
      }}>
        <div className="content-header" style={{ background: "#fff", borderBottom: "1px solid #dee2e6" }}>
          <div className="container-fluid">
            <div className="row mb-2 align-items-center">
              <div className="col-sm-6">
                <h1 className="m-0">
                  {location.pathname.includes("/orders") && "Pesanan"}
                  {location.pathname.includes("/cars") && "Daftar Mobil"}
                  {location.pathname.includes("/users") && "Daftar Pengguna"}
                  {isDashboardHome && "Dashboard"}
                </h1>
              </div>
              <div className="col-sm-6">
                <ol className="breadcrumb float-sm-right">
                  <li className="breadcrumb-item active">
                    {location.pathname.replace("/admin/", "").toUpperCase() || "DASHBOARD"}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        <div className="content pt-3">
          <div className="container-fluid">
            {isDashboardHome ? <DashboardHome /> : <Outlet />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;