import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { Card, Table, Spinner, Badge, Alert, Button, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  FiFileText, FiTruck, FiUsers, FiDollarSign,
  FiAlertCircle, FiPlusCircle, FiTrendingUp, FiPieChart, FiUserPlus
} from "react-icons/fi";
import { FaChartBar, FaCrown } from "react-icons/fa";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import "./AdminDashboard.css";
import { API_URL } from "../utils/api"; // GUNAKAN API_URL dari utils/api.js
import AdminAIChatbot from "./AdminAIChatbot.jsx"; // Tambahkan ini

const StatCard = ({ icon, title, value, color, loading }) => (
  <Card className="stat-card shadow-sm mb-3 border-0">
    <Card.Body className="d-flex align-items-center">
      <div className="stat-icon me-3 d-flex align-items-center justify-content-center rounded-circle shadow" style={{ backgroundColor: `${color}20`, color, width: 54, height: 54, fontSize: 28 }}>
        {icon}
      </div>
      <div className="stat-content">
        <h6 className="stat-title mb-1">{title}</h6>
        <h3 className="stat-value mb-0">
          {loading ? <Spinner animation="border" size="sm" /> : value}
        </h3>
      </div>
    </Card.Body>
  </Card>
);

const DashboardHome = ({
  stats, setStats, latestUsers, setLatestUsers, latestOrders, setLatestOrders,
  loading, setLoading, orderChart, setOrderChart, revenueChart, setRevenueChart,
  userChart, setUserChart, notif, setNotif, topCars, setTopCars, occupancyChart, setOccupancyChart
}) => {
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

        // Okupansi mobil
        const occupancyData = cars.map(car => {
          const totalOrder = orders.filter(o => o.layanan_id === car.id && o.status !== "cancelled").length;
          return { name: car.nama, value: totalOrder };
        });
        setOccupancyChart({
          tooltip: { trigger: "item" },
          legend: { top: "5%", left: "center" },
          series: [
            {
              name: "Okupansi Mobil",
              type: "pie",
              radius: ["40%", "70%"],
              data: occupancyData
            }
          ]
        });

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    const prepareCharts = (orders, users) => {
      const monthsArr = moment.monthsShort();
      const now = new Date();
      const year = now.getFullYear();

      // Orders, revenue, user per month
      const monthlyOrdersArr = Array(12).fill(0);
      const monthlyRevenueArr = Array(12).fill(0);
      const monthlyUsersArr = Array(12).fill(0);

      orders.forEach(order => {
        const created = order.createdAt || order.created_at || order.order_date;
        if (created) {
          const date = new Date(created);
          if (date.getFullYear() === year) {
            const month = date.getMonth();
            monthlyOrdersArr[month] += 1;
            if (order.payment_status === "paid") {
              monthlyRevenueArr[month] += Number(order.total_price) || 0;
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
            monthlyUsersArr[month] += 1;
          }
        }
      });

      setOrderChart({
        tooltip: { trigger: 'axis' },
        grid: { left: 50, right: 30, bottom: 50, top: 40 },
        xAxis: {
          type: 'category',
          data: monthsArr,
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
            data: monthlyOrdersArr,
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
        grid: { left: 50, right: 30, bottom: 50, top: 40 },
        xAxis: {
          type: 'category',
          data: monthsArr,
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
            data: monthlyRevenueArr,
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
          data: monthsArr,
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
            data: monthlyUsersArr,
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
        .map(([id, data], idx) => {
          const car = cars.find(c => c.id.toString() === id.toString());
          return {
            id,
            nama: car?.nama || "-",
            gambar: car?.gambar || "/images/car-placeholder.png",
            count: data.count,
            omzet: data.omzet,
            rank: idx + 1
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
        <Alert variant="warning" className="alert-notification mb-4 shadow-sm">
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
      <Row className="g-4 mb-4">
        <Col xs={6} md={3}>
          <StatCard icon={<FiFileText />} title="Total Pesanan" value={stats.orders} color="#6366f1" loading={loading} />
        </Col>
        <Col xs={6} md={3}>
          <StatCard icon={<FiTruck />} title="Jumlah Mobil" value={stats.cars} color="#10b981" loading={loading} />
        </Col>
        <Col xs={6} md={3}>
          <StatCard icon={<FiUsers />} title="Pengguna Terdaftar" value={stats.users} color="#3b82f6" loading={loading} />
        </Col>
        <Col xs={6} md={3}>
          <StatCard icon={<FiDollarSign />} title="Total Pendapatan" value={formatCurrency(stats.revenue)} color="#f59e0b" loading={loading} />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-4 mb-4">
        <Col lg={4} md={12}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-primary text-white fw-semibold d-flex align-items-center">
              <FiTrendingUp className="me-2" /> Pesanan Bulanan
            </Card.Header>
            <Card.Body className="bg-light">
              {loading || !orderChart ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <ReactECharts option={orderChart} style={{ height: 220 }} />
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-success text-white fw-semibold d-flex align-items-center">
              <FiDollarSign className="me-2" /> Pendapatan Bulanan
            </Card.Header>
            <Card.Body className="bg-light">
              {loading || !revenueChart ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : (
                <ReactECharts option={revenueChart} style={{ height: 220 }} />
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-warning text-dark fw-semibold d-flex align-items-center">
              <FiUserPlus className="me-2" /> User Baru Bulanan
            </Card.Header>
            <Card.Body className="bg-light">
              {loading || !userChart ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="warning" />
                </div>
              ) : (
                <ReactECharts option={userChart} style={{ height: 220 }} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Cars & Pie Chart */}
      <Row className="g-4 mb-4">
        <Col lg={6} md={12}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-info text-white fw-semibold d-flex align-items-center">
              <FaCrown className="me-2" /> Mobil Terlaris Bulan Ini
            </Card.Header>
            <Card.Body>
              <ul className="list-group list-group-flush">
                {topCars.length === 0 && (
                  <li className="list-group-item text-muted">Belum ada data.</li>
                )}
                {topCars.map((car, idx) => (
                  <li
                    className="list-group-item d-flex align-items-center border-0 border-bottom py-3"
                    key={car.id}
                    style={{ background: idx === 0 ? "linear-gradient(90deg, #e0f7fa 0%, #fff 100%)" : "inherit" }}
                  >
                    <span
                      className="badge me-3 d-flex align-items-center justify-content-center"
                      style={{
                        fontSize: 20,
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: idx === 0 ? "#ffd700" : idx === 1 ? "#b0b0b0" : "#cd7f32",
                        color: "#fff",
                        boxShadow: idx === 0 ? "0 0 10px #ffd70088" : undefined
                      }}
                    >
                      <FaCrown className="me-1" />
                      {idx + 1}
                    </span>
                    <img
                      src={car.gambar || "/images/car-placeholder.png"}
                      alt={car.nama}
                      className="me-3 rounded shadow-sm"
                      style={{ width: 64, height: 40, objectFit: "cover", border: "2px solid #eee" }}
                    />
                    <div>
                      <div className="fw-bold" style={{ fontSize: 17 }}>{car.nama}</div>
                      <div className="small text-muted">
                        <Badge bg="success" className="me-2">{car.count}x</Badge>
                        Omzet: <span className="fw-semibold">{formatCurrency(car.omzet)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} md={12}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-secondary text-white fw-semibold d-flex align-items-center">
              <FiPieChart className="me-2" /> Status Pesanan Bulanan
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="info" />
                </div>
              ) : (
                <ReactECharts
                  style={{ height: 220 }}
                  option={{
                    tooltip: { trigger: 'item' },
                    legend: { orient: 'vertical', left: 'left' },
                    series: [
                      {
                        name: 'Status Pesanan',
                        type: 'pie',
                        radius: '70%',
                        data: [
                          { value: stats.pendingOrders, name: 'Pending', itemStyle: { color: "#f59e0b" } },
                          { value: stats.paidOrders, name: 'Dibayar', itemStyle: { color: "#10b981" } },
                          { value: stats.orders - stats.pendingOrders - stats.paidOrders, name: 'Lainnya', itemStyle: { color: "#6366f1" } }
                        ],
                        emphasis: {
                          itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                          }
                        }
                      }
                    ]
                  }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders & Users */}
      <Row className="g-4 mb-4">
        <Col xs={12} md={6}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
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
                <Table hover responsive className="mb-0 align-middle">
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
                      <tr key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)} style={{ cursor: "pointer" }}>
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
        </Col>
        <Col xs={12} md={6}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
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
                <Table hover responsive className="mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Email</th>
                      <th>Bergabung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestUsers.map(user => (
                      <tr key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)} style={{ cursor: "pointer" }}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontWeight: 600 }}>
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
        </Col>
      </Row>

      {/* Grafik Okupansi Mobil */}
      <Row className="g-4 mb-4">
        <Col lg={12}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-dark text-white fw-semibold d-flex align-items-center">
              <FiPieChart className="me-2" /> Grafik Okupansi Mobil
            </Card.Header>
            <Card.Body>
              {loading || !occupancyChart ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="dark" />
                </div>
              ) : (
                <ReactECharts option={occupancyChart} style={{ height: 320 }} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="g-4 mb-2">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="fw-semibold bg-light">Aksi Cepat</Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col xs={6} md={3}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Tambah Mobil</Tooltip>}>
                    <Button
                      variant="outline-success"
                      className="w-100 d-flex flex-column align-items-center justify-content-center py-4 rounded shadow-sm quick-action-btn"
                      onClick={() => navigate('/admin/cars')}
                    >
                      <FiPlusCircle size={32} className="mb-2" />
                      <span className="fw-semibold">Tambah Mobil</span>
                    </Button>
                  </OverlayTrigger>
                </Col>
                <Col xs={6} md={3}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Kelola Pesanan</Tooltip>}>
                    <Button
                      variant="outline-info"
                      className="w-100 d-flex flex-column align-items-center justify-content-center py-4 rounded shadow-sm quick-action-btn"
                      onClick={() => navigate('/admin/orders')}
                    >
                      <FiFileText size={32} className="mb-2" />
                      <span className="fw-semibold">Kelola Pesanan</span>
                    </Button>
                  </OverlayTrigger>
                </Col>
                <Col xs={6} md={3}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Kelola User</Tooltip>}>
                    <Button
                      variant="outline-primary"
                      className="w-100 d-flex flex-column align-items-center justify-content-center py-4 rounded shadow-sm quick-action-btn"
                      onClick={() => navigate('/admin/users')}
                    >
                      <FiUsers size={32} className="mb-2" />
                      <span className="fw-semibold">Kelola User</span>
                    </Button>
                  </OverlayTrigger>
                </Col>
                <Col xs={6} md={3}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Laporan</Tooltip>}>
                    <Button
                      variant="outline-dark"
                      className="w-100 d-flex flex-column align-items-center justify-content-center py-4 rounded shadow-sm quick-action-btn"
                      onClick={() => navigate('/admin/report')}
                    >
                      <FaChartBar size={32} className="mb-2" />
                      <span className="fw-semibold">Laporan</span>
                    </Button>
                  </OverlayTrigger>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

const AdminDashboard = ({ darkMode, toggleDarkMode }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // --- Angkat state ke sini ---
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
  const [occupancyChart, setOccupancyChart] = useState(null);

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
            {isDashboardHome ? (
              <DashboardHome
                stats={stats}
                setStats={setStats}
                latestUsers={latestUsers}
                setLatestUsers={setLatestUsers}
                latestOrders={latestOrders}
                setLatestOrders={setLatestOrders}
                loading={loading}
                setLoading={setLoading}
                orderChart={orderChart}
                setOrderChart={setOrderChart}
                revenueChart={revenueChart}
                setRevenueChart={setRevenueChart}
                userChart={userChart}
                setUserChart={setUserChart}
                notif={notif}
                setNotif={setNotif}
                topCars={topCars}
                setTopCars={setTopCars}
                occupancyChart={occupancyChart}
                setOccupancyChart={setOccupancyChart}
              />
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
      <AdminAIChatbot stats={stats} omzet={stats.revenue} orders={stats.orders} users={stats.users} />
    </div>
  );
};

export default AdminDashboard;