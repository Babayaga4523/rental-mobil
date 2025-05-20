import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { Card, Table, Spinner, Badge, Alert, ProgressBar } from "react-bootstrap";
import {
  FiFileText, FiTruck, FiUsers, FiDollarSign,
  FiAlertCircle, FiTrendingUp, FiSettings, FiUser
} from "react-icons/fi";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement
} from "chart.js";
import moment from "moment";
import "./AdminDashboard.css";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

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
    pendingOrders: 0
  });
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [notif, setNotif] = useState("");
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

        // Calculate total revenue
        const totalRevenue = orders
          .filter(order => order.payment_status === "paid")
          .reduce((sum, order) => sum + (order.total_price || 0), 0);

        // Pending verification orders
        const pendingVerif = orders.filter(o =>
          o.payment_status === "pending_verification"
        ).length;

        setStats({
          orders: orders.length,
          cars: cars.length,
          users: users.length,
          revenue: totalRevenue,
          pendingOrders: pendingVerif
        });

        setNotif(
          pendingVerif > 0
            ? `Ada ${pendingVerif} pesanan menunggu verifikasi pembayaran!`
            : ""
        );

        // Prepare chart data
        prepareCharts(orders);
        prepareLatestData(orders, users);
        prepareActivityData(orders);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    const prepareCharts = (orders) => {
      const months = moment.monthsShort();
      const now = new Date();
      const year = now.getFullYear();

      // Orders per month
      const monthlyOrders = Array(12).fill(0);
      const monthlyRevenue = Array(12).fill(0);

      orders.forEach(order => {
        const created = order.createdAt || order.created_at || order.order_date;
        if (created) {
          const date = new Date(created);
          if (date.getFullYear() === year) {
            const month = date.getMonth();
            monthlyOrders[month] += 1;
            if (order.payment_status === "paid") {
              monthlyRevenue[month] += order.total_price || 0;
            }
          }
        }
      });

      setChartData({
        labels: months,
        datasets: [
          {
            label: `Pesanan ${year}`,
            data: monthlyOrders,
            backgroundColor: "#6366f1",
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      });

      setRevenueData({
        labels: months,
        datasets: [
          {
            label: `Pendapatan ${year}`,
            data: monthlyRevenue,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.3,
            fill: true,
            borderWidth: 2,
          },
        ],
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

    const prepareActivityData = (orders) => {
      const recentActivities = [
        {
          id: 1,
          type: "login",
          title: "Admin login",
          timestamp: new Date(),
          icon: <FiUser className="text-primary" />
        },
        {
          id: 2,
          type: "order",
          title: "Pesanan baru diterima",
          timestamp: orders.length > 0
            ? new Date(orders[0].createdAt || orders[0].created_at || orders[0].order_date)
            : new Date(),
          icon: <FiFileText className="text-success" />
        },
        {
          id: 3,
          type: "payment",
          title: "Pembayaran terverifikasi",
          timestamp: orders.length > 1
            ? new Date(orders[1].updatedAt || orders[1].updated_at)
            : new Date(),
          icon: <FiDollarSign className="text-warning" />
        },
        {
          id: 4,
          type: "car",
          title: "Mobil baru ditambahkan",
          timestamp: new Date(),
          icon: <FiTruck className="text-info" />
        }
      ];
      setActivityData(recentActivities);
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
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return moment(date).format('DD MMM YYYY');
  };

  return (
    <div className="dashboard-home">
      {/* Notification Alert */}
      {notif && (
        <Alert variant="warning" className="alert-notification">
          <div className="d-flex align-items-center">
            <FiAlertCircle className="me-2" size={20} />
            <span>{notif}</span>
            <button
              className="btn btn-sm btn-warning ms-auto"
              onClick={() => navigate('/admin/orders')}
            >
              Lihat Pesanan
            </button>
          </div>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-6 col-lg-3">
          <StatCard
            icon={<FiFileText size={24} />}
            title="Total Pesanan"
            value={stats.orders}
            color="#6366f1"
            loading={loading}
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatCard
            icon={<FiTruck size={24} />}
            title="Jumlah Mobil"
            value={stats.cars}
            color="#10b981"
            loading={loading}
          />
        </div>
        <div className="col-md-6 col-lg-3">
          <StatCard
            icon={<FiUsers size={24} />}
            title="Pengguna Terdaftar"
            value={stats.users}
            color="#3b82f6"
            loading={loading}
          />
        </div>
        <div className="col-md-6 col-lg-3">
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
        <div className="col-lg-8">
          <Card className="h-100">
            <Card.Header className="card-header">
              <h5 className="card-title">Grafik Pesanan Bulanan</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <div className="chart-container">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            drawBorder: false,
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-4">
          <Card className="h-100">
            <Card.Header className="card-header">
              <h5 className="card-title">Grafik Pendapatan</h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="success" />
                </div>
              ) : (
                <div className="chart-container">
                  <Line
                    data={revenueData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            drawBorder: false,
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              )}
            </Card.Body>
            <Card.Footer className="card-footer">
              <div className="d-flex justify-content-between">
                <small className="text-muted">Update terakhir: {moment().format('DD MMM YYYY')}</small>
                <small className="text-success">
                  <FiTrendingUp className="me-1" />
                  {stats.orders > 0 ? Math.round((stats.revenue / stats.orders) / 1000) * 10 : 0}% dari bulan lalu
                </small>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>

      {/* Recent Data Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <Card>
            <Card.Header className="card-header">
              <h5 className="card-title">Pesanan Terbaru</h5>
              <div className="card-actions">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate('/admin/orders')}
                >
                  Lihat Semua
                </button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : latestOrders.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Tidak ada pesanan</p>
                </div>
              ) : (
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
              )}
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-6">
          <Card>
            <Card.Header className="card-header">
              <h5 className="card-title">Pengguna Terbaru</h5>
              <div className="card-actions">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate('/admin/users')}
                >
                  Lihat Semua
                </button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : latestUsers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Tidak ada pengguna</p>
                </div>
              ) : (
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
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="row g-4">
        <div className="col-lg-6">
          <Card>
            <Card.Header className="card-header">
              <h5 className="card-title">Aktivitas Terbaru</h5>
            </Card.Header>
            <Card.Body>
              <div className="activity-feed">
                {activityData.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      {activity.icon}
                    </div>
                    <div className="activity-content">
                      <h6>{activity.title}</h6>
                      <small className="text-muted">
                        {moment(activity.timestamp).fromNow()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
        <div className="col-lg-6">
          <Card>
            <Card.Header className="card-header">
              <h5 className="card-title">Status Sistem</h5>
            </Card.Header>
            <Card.Body>
              <div className="system-status">
                <div className="status-item">
                  <div className="status-info">
                    <h6>Pesanan Pending</h6>
                    <small className="text-muted">
                      {stats.pendingOrders} menunggu verifikasi
                    </small>
                  </div>
                  <ProgressBar
                    now={(stats.pendingOrders / stats.orders) * 100 || 0}
                    variant="warning"
                    className="status-progress"
                  />
                </div>
                <div className="status-item">
                  <div className="status-info">
                    <h6>Beban Server</h6>
                    <small className="text-muted">
                      Optimal
                    </small>
                  </div>
                  <ProgressBar
                    now={15}
                    variant="success"
                    className="status-progress"
                  />
                </div>
                <div className="status-item">
                  <div className="status-info">
                    <h6>Penyimpanan</h6>
                    <small className="text-muted">
                      45% dari 50GB terpakai
                    </small>
                  </div>
                  <ProgressBar
                    now={45}
                    variant="info"
                    className="status-progress"
                  />
                </div>
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

export default AdminDashboard;