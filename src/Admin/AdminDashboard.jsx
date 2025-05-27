import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { Card, Table, Spinner, Badge, Alert, Button, Accordion } from "react-bootstrap";
import {
  FiFileText, FiTruck, FiUsers, FiDollarSign,
  FiAlertCircle, FiPlusCircle
} from "react-icons/fi";
import { FaChartBar } from "react-icons/fa";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import "./AdminDashboard.css";

const API_URL = "http://localhost:3000/api";

const StatCard = ({ icon, title, value, color, loading }) => (
  <Card className="stat-card">
    <Card.Body>
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h6 className="stat-title">{title}</h6>
        <h3 className="stat-value">
          {loading ? <Spinner animation="border" size="sm" /> : value}
        </h3>
      </div>
    </Card.Body>
  </Card>
);

const DashboardHome = () => {
  const [stats, setStats] = useState({
    orders: 0,
    cars: 0,
    users: 0,
    revenue: 0,
    availableCars: 0,
    unavailableCars: 0,
    pendingOrders: 0,
    paidOrders: 0
  });
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderChart, setOrderChart] = useState(null);
  const [revenueChart, setRevenueChart] = useState(null);
  const [userChart, setUserChart] = useState(null);
  const [notif, setNotif] = useState("");
  const [topCars, setTopCars] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [ordersRes, carsRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/orders/admin/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/layanan`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        const orders = Array.isArray(ordersRes.data.data) ? ordersRes.data.data : [];
        const cars = Array.isArray(carsRes.data.data) ? carsRes.data.data : [];
        const users = Array.isArray(usersRes.data.data)
          ? usersRes.data.data
          : (Array.isArray(usersRes.data.users) ? usersRes.data.users : []);

        // Statistik
        const totalRevenue = orders
          .filter(order => order.payment_status === "paid")
          .reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);

        const availableCars = cars.filter(car => car.status === "available").length;
        const unavailableCars = cars.length - availableCars;
        const pendingOrders = orders.filter(o => o.payment_status === "pending_verification").length;
        const paidOrders = orders.filter(o => o.payment_status === "paid").length;

        setStats({
          orders: orders.length,
          cars: cars.length,
          users: users.length,
          revenue: totalRevenue,
          availableCars,
          unavailableCars,
          pendingOrders,
          paidOrders
        });

        setNotif(
          pendingOrders > 0
            ? `Ada ${pendingOrders} pesanan menunggu verifikasi pembayaran!`
            : ""
        );

        // Grafik tren
        prepareCharts(orders, users);

        // Pesanan & user terbaru
        prepareLatestData(orders, users);

        // Mobil terlaris bulan ini
        prepareTopCars(orders, cars);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    const prepareCharts = (orders, users) => {
      const months = moment.monthsShort();
      const now = new Date();
      const year = now.getFullYear();

      // Orders, revenue, user per month
      const monthlyOrders = Array(12).fill(0);
      const monthlyRevenue = Array(12).fill(0);
      const monthlyUsers = Array(12).fill(0);

      orders.forEach(order => {
        const created = order.createdAt || order.created_at || order.order_date;
        if (created) {
          const date = new Date(created);
          if (date.getFullYear() === year) {
            const month = date.getMonth();
            monthlyOrders[month] += 1;
            if (order.payment_status === "paid") {
              monthlyRevenue[month] += Number(order.total_price) || 0;
            }
          }
        }
      });

      users.forEach(user => {
        const created = user.createdAt || user.created_at;
        if (created) {
          const date = new Date(created);
          if (date.getFullYear() === year) {
            const month = date.getMonth();
            monthlyUsers[month] += 1;
          }
        }
      });

      setOrderChart({
        tooltip: { trigger: 'axis' },
        grid: { left: 50, right: 30, bottom: 50, top: 40 },
        xAxis: {
          type: 'category',
          data: months,
          axisLabel: { rotate: 30, fontSize: 13 }
        },
        yAxis: {
          type: 'value',
          name: 'Pesanan',
          axisLabel: { fontSize: 13 }
        },
        series: [
          {
            name: 'Pesanan',
            type: 'line',
            data: monthlyOrders,
            smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: { width: 4, color: "#6366f1" },
            itemStyle: { color: "#6366f1" },
            areaStyle: { color: "rgba(99,102,241,0.10)" }
          }
        ]
      });

      setRevenueChart({
        tooltip: { trigger: 'axis' },
        grid: { left: 80, right: 30, bottom: 50, top: 40 },
        xAxis: {
          type: 'category',
          data: months,
          axisLabel: { rotate: 30, fontSize: 13 }
        },
        yAxis: {
          type: 'value',
          name: 'Omzet (Rp)',
          axisLabel: {
            fontSize: 13,
            formatter: value => {
              if (value >= 1_000_000) return `Rp${(value/1_000_000).toFixed(1)}jt`;
              if (value >= 1_000) return `Rp${(value/1_000).toFixed(0)}rb`;
              return `Rp${value}`;
            }
          }
        },
        series: [
          {
            name: 'Omzet',
            type: 'line',
            data: monthlyRevenue,
            smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: { width: 4, color: "#10b981" },
            itemStyle: { color: "#10b981" },
            areaStyle: { color: "rgba(16,185,129,0.10)" }
          }
        ]
      });

      setUserChart({
        tooltip: { trigger: 'axis' },
        grid: { left: 50, right: 30, bottom: 50, top: 40 },
        xAxis: {
          type: 'category',
          data: months,
          axisLabel: { rotate: 30, fontSize: 13 }
        },
        yAxis: {
          type: 'value',
          name: 'User Baru',
          axisLabel: { fontSize: 13 }
        },
        series: [
          {
            name: 'User Baru',
            type: 'line',
            data: monthlyUsers,
            smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: { width: 4, color: "#f59e0b" },
            itemStyle: { color: "#f59e0b" },
            areaStyle: { color: "rgba(245,158,11,0.08)" }
          }
        ]
      });
    };

    const prepareLatestData = (orders, users) => {
      // Latest 5 orders
      const sortedOrders = [...orders].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at || a.order_date);
        const dateB = new Date(b.createdAt || b.created_at || b.order_date);
        return dateB - dateA;
      });
      setLatestOrders(sortedOrders.slice(0, 5));

      // Latest 5 users
      const sortedUsers = [...users].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.created_at);
        const dateB = new Date(b.createdAt || b.created_at);
        return dateB - dateA;
      });
      setLatestUsers(sortedUsers.slice(0, 5));
    };

    const prepareTopCars = (orders, cars) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const carCount = {};

      orders.forEach(order => {
        const created = order.createdAt || order.created_at || order.order_date;
        if (created) {
          const date = new Date(created);
          if (date.getFullYear() === year && date.getMonth() === month) {
            const carId = order.layanan?.id || order.layanan_id;
            if (!carId) return;
            if (!carCount[carId]) {
              carCount[carId] = { count: 0, omzet: 0 };
            }
            carCount[carId].count += 1;
            carCount[carId].omzet += Number(order.total_price) || 0;
          }
        }
      });

      const top = Object.entries(carCount)
        .map(([id, data]) => {
          const car = cars.find(c => c.id.toString() === id.toString());
          return {
            id,
            nama: car?.nama || "-",
            gambar: car?.gambar || "/images/car-placeholder.png",
            count: data.count,
            omzet: data.omzet
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setTopCars(top);
    };

    fetchDashboardData();
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning" className="badge-pill">Pending</Badge>;
      case "confirmed":
        return <Badge bg="info" className="badge-pill">Confirmed</Badge>;
      case "completed":
        return <Badge bg="success" className="badge-pill">Completed</Badge>;
      case "cancelled":
        return <Badge bg="danger" className="badge-pill">Cancelled</Badge>;
      default:
        return <Badge bg="secondary" className="badge-pill">Unknown</Badge>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge bg="success" className="badge-pill">Paid</Badge>;
      case "pending_verification":
        return <Badge bg="warning" className="badge-pill">Pending</Badge>;
      case "rejected":
        return <Badge bg="danger" className="badge-pill">Rejected</Badge>;
      default:
        return <Badge bg="secondary" className="badge-pill">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "Rp0";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatDate = (date) => {
    return moment(date).format('DD MMM YYYY');
  };

  return (
    <div className="dashboard-home py-4 px-2 px-md-4">
      {/* Notification Alert */}
      {notif && (
        <Alert variant="warning" className="alert-notification mb-4">
          <div className="d-flex align-items-center">
            <FiAlertCircle className="me-2" size={20} />
            <span>{notif}</span>
            <Button
              size="sm"
              variant="warning"
              className="ms-auto"
              onClick={() => navigate('/admin/orders')}
            >
              Lihat Pesanan
            </Button>
          </div>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-6 col-md-3">
          <StatCard
            icon={<FiFileText size={24} />}
            title="Total Pesanan"
            value={stats.orders}
            color="#6366f1"
            loading={loading}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon={<FiTruck size={24} />}
            title="Jumlah Mobil"
            value={stats.cars}
            color="#10b981"
            loading={loading}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon={<FiUsers size={24} />}
            title="Pengguna Terdaftar"
            value={stats.users}
            color="#3b82f6"
            loading={loading}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon={<FiDollarSign size={24} />}
            title="Total Pendapatan"
            value={formatCurrency(stats.revenue)}
            color="#f59e0b"
            loading={loading}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-4">
          <Card className="h-100 mb-4">
            <Card.Header>
              <h5 className="card-title">Grafik Pesanan Bulanan</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <ReactECharts
                  style={{ height: 220 }}
                  option={orderChart}
                />
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="h-100 mb-4">
            <Card.Header>
              <h5 className="card-title">Grafik Pendapatan</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : (
                <ReactECharts
                  style={{ height: 220 }}
                  option={revenueChart}
                />
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="h-100 mb-4">
            <Card.Header>
              <h5 className="card-title">Grafik User Baru</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="info" />
                </div>
              ) : (
                <ReactECharts
                  style={{ height: 220 }}
                  option={userChart}
                />
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Widget Mobil Terlaris & Recent Activity */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Mobil Terlaris Bulan Ini</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-group list-group-flush">
                {topCars.map(car => (
                  <li className="list-group-item d-flex align-items-center">
                    <img src={car.gambar} alt={car.nama} style={{ width: 64, height: 40, objectFit: "cover", borderRadius: 6, marginRight: 16 }} />
                    <div>
                      <div className="fw-bold">{car.nama}</div>
                      <div className="small text-muted">Disewa {car.count}x | Omzet: {formatCurrency(car.omzet)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </div>
        <div className="col-12">
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Pesanan Terbaru</h5>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => navigate('/admin/orders')}
              >
                Lihat Semua
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>ID Pesanan</th>
                      <th>Pelanggan</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrders.map(order => (
                      <tr key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)}>
                        <td className="text-primary">#{order.id}</td>
                        <td>{order.user?.name || '-'}</td>
                        <td>{formatCurrency(order.total_price || 0)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {getPaymentBadge(order.payment_status)}
                            <div className="ms-2">
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-12">
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Pengguna Terbaru</h5>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => navigate('/admin/users')}
              >
                Lihat Semua
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Bergabung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestUsers.map(user => (
                      <tr key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-2">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            {user.name}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{formatDate(user.createdAt || user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row g-4 mb-2">
        <div className="col-lg-12">
          <Card>
            <Card.Header>Aksi Cepat</Card.Header>
            <Card.Body>
              <div className="quick-actions">
                <Button
                  variant="outline-success"
                  className="btn-action"
                  onClick={() => navigate('/admin/cars/add')}
                >
                  <FiPlusCircle size={28} />
                  <span>Tambah Mobil</span>
                </Button>
                <Button
                  variant="outline-info"
                  className="btn-action"
                  onClick={() => navigate('/admin/orders')}
                >
                  <FiFileText size={28} />
                  <span>Kelola Pesanan</span>
                </Button>
                <Button
                  variant="outline-primary"
                  className="btn-action"
                  onClick={() => navigate('/admin/users')}
                >
                  <FiUsers size={28} />
                  <span>Kelola User</span>
                </Button>
                <Button
                  variant="outline-dark"
                  className="btn-action"
                  onClick={() => navigate('/admin/report')}
                >
                  <FaChartBar size={28} />
                  <span>Laporan</span>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ darkMode, toggleDarkMode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const isDashboardHome = location.pathname === "/admin" || location.pathname === "/admin/";

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      <AdminNavbar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        toggleSidebar={toggleSidebar}
      />
      <AdminSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        darkMode={darkMode}
      />
      <div
        className="content-wrapper"
        style={{
          marginLeft: sidebarCollapsed ? '70px' : '250px'
        }}
      >
        <div className="content">
          <div className="container-fluid">
            {isDashboardHome ? <DashboardHome /> : <Outlet />}
          </div>
        </div>
      </div>
    </div>
  );
};

const HelpPage = () => (
  <div className="container py-4">
    <h4>Help & FAQ</h4>
    <Accordion>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Bagaimana cara menambah mobil?</Accordion.Header>
        <Accordion.Body>Buka menu Data Mobil, klik Tambah Mobil, isi form dan simpan.</Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Bagaimana mengelola pesanan?</Accordion.Header>
        <Accordion.Body>Buka menu Pesanan, klik detail untuk melihat atau ubah status pesanan.</Accordion.Body>
      </Accordion.Item>
      {/* Tambah pertanyaan lain */}
    </Accordion>
  </div>
);

export default AdminDashboard;