import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import axios from "axios";
import { Card, Table, Spinner, Badge, Alert, Button, Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  FiFileText, FiTruck, FiUsers, FiDollarSign,
  FiAlertCircle, FiPlusCircle, FiTrendingUp, FiPieChart, FiUserPlus,
  FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiBarChart2
} from "react-icons/fi";
import { FaChartBar, FaCrown, FaCar } from "react-icons/fa";
import { BsGraphUp, BsPeople } from "react-icons/bs";
import ReactECharts from "echarts-for-react";
import moment from "moment";
import "./AdminDashboard.css";
import { API_URL } from "../utils/api";
import AdminAIChatbot from "./AdminAIChatbot.jsx";

// Custom StatCard component with improved design
const StatCard = ({ icon, title, value, color, loading, trend, trendColor }) => (
  <Card className="stat-card shadow-sm mb-3 border-0 h-100">
    <Card.Body className="d-flex align-items-center p-3">
      <div 
        className="stat-icon me-3 d-flex align-items-center justify-content-center rounded-circle" 
        style={{ 
          backgroundColor: `${color}20`, 
          color, 
          width: 48, 
          height: 48, 
          fontSize: 24 
        }}
      >
        {icon}
      </div>
      <div className="stat-content flex-grow-1">
        <h6 className="stat-title mb-1 text-muted small">{title}</h6>
        <h3 className="stat-value mb-0 fw-bold">
          {loading ? <Spinner animation="border" size="sm" /> : value}
        </h3>
        {trend && (
          <div className="stat-trend mt-1 small" style={{ color: trendColor }}>
            {trend}
          </div>
        )}
      </div>
    </Card.Body>
  </Card>
);

// ChartCard component for consistent chart styling
const ChartCard = ({ title, icon, color, loading, children, className = "" }) => (
  <Card className={`h-100 shadow-sm border-0 ${className}`}>
    <Card.Header 
      className={`text-white fw-semibold d-flex align-items-center`}
      style={{ backgroundColor: color }}
    >
      {icon && React.cloneElement(icon, { className: "me-2" })}
      {title}
    </Card.Header>
    <Card.Body className="p-2">
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        children
      )}
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

        // Calculate stats
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

        // Prepare charts and data
        prepareCharts(orders, users);
        prepareLatestData(orders, users);
        prepareTopCars(orders, cars);
        prepareOccupancyChart(orders, cars);

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

      // Initialize arrays for monthly data
      const monthlyOrdersArr = Array(12).fill(0);
      const monthlyRevenueArr = Array(12).fill(0);
      const monthlyUsersArr = Array(12).fill(0);

      // Process orders data
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

      // Process users data
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

      // Set chart options
      setOrderChart(getChartOptions(
        monthsArr, 
        monthlyOrdersArr, 
        "Pesanan", 
        "#6366f1", 
        "Pesanan"
      ));

      setRevenueChart(getChartOptions(
        monthsArr, 
        monthlyRevenueArr, 
        "Omzet (Rp)", 
        "#10b981", 
        "Omzet",
        value => {
          if (value >= 1_000_000) return `Rp${(value/1_000_000).toFixed(1)}jt`;
          if (value >= 1_000) return `Rp${(value/1_000).toFixed(0)}rb`;
          return `Rp${value}`;
        }
      ));

      setUserChart(getChartOptions(
        monthsArr, 
        monthlyUsersArr, 
        "User Baru", 
        "#f59e0b", 
        "User Baru"
      ));
    };

    const getChartOptions = (xAxisData, seriesData, yAxisName, color, seriesName, formatter) => {
      return {
        tooltip: { 
          trigger: 'axis',
          formatter: formatter ? (params) => {
            return `${params[0].axisValue}<br/>${seriesName}: ${formatter(params[0].value)}`;
          } : null
        },
        grid: { left: '3%', right: '3%', bottom: '15%', top: '10%' },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLabel: { 
            rotate: 30, 
            fontSize: 12,
            margin: 10
          },
          axisLine: { show: false },
          axisTick: { show: false }
        },
        yAxis: {
          type: 'value',
          name: yAxisName,
          nameTextStyle: { padding: [0, 0, 0, 30] },
          axisLabel: { 
            fontSize: 12,
            formatter: formatter
          },
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          }
        },
        series: [
          {
            name: seriesName,
            type: 'line',
            data: seriesData,
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            lineStyle: { width: 3, color },
            itemStyle: { color },
            areaStyle: { 
              color: new ReactECharts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${color}40` },
                { offset: 1, color: `${color}10` }
              ]) 
            }
          }
        ]
      };
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

    const prepareOccupancyChart = (orders, cars) => {
      const occupancyData = cars.map(car => {
        const totalOrder = orders.filter(o => o.layanan_id === car.id && o.status !== "cancelled").length;
        return { 
          name: car.nama, 
          value: totalOrder,
          itemStyle: {
            color: getRandomColor()
          }
        };
      });

      setOccupancyChart({
        tooltip: { 
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
        legend: { 
          top: "5%", 
          left: "center",
          textStyle: {
            fontSize: 12
          }
        },
        series: [
          {
            name: "Okupansi Mobil",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: occupancyData
          }
        ]
      });
    };

    const getRandomColor = () => {
      const colors = [
        '#6366f1', '#10b981', '#f59e0b', '#3b82f6', 
        '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    fetchDashboardData();
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning" className="badge-pill py-1 px-2">Pending</Badge>;
      case "confirmed":
        return <Badge bg="info" className="badge-pill py-1 px-2">Confirmed</Badge>;
      case "completed":
        return <Badge bg="success" className="badge-pill py-1 px-2">Completed</Badge>;
      case "cancelled":
        return <Badge bg="danger" className="badge-pill py-1 px-2">Cancelled</Badge>;
      default:
        return <Badge bg="secondary" className="badge-pill py-1 px-2">Unknown</Badge>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge bg="success" className="badge-pill py-1 px-2">Paid</Badge>;
      case "pending_verification":
        return <Badge bg="warning" className="badge-pill py-1 px-2">Pending</Badge>;
      case "rejected":
        return <Badge bg="danger" className="badge-pill py-1 px-2">Rejected</Badge>;
      default:
        return <Badge bg="secondary" className="badge-pill py-1 px-2">Unknown</Badge>;
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

  const getTrendIndicator = (current, previous) => {
    if (!previous || previous === 0) return null;
    const percentage = ((current - previous) / previous * 100).toFixed(1);
    const isPositive = percentage >= 0;
    
    return (
      <span className={`trend-indicator ${isPositive ? 'text-success' : 'text-danger'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(percentage)}%
      </span>
    );
  };

  return (
    <div className="dashboard-home p-3 p-md-4">
      {/* Notification Alert */}
      {notif && (
        <Alert variant="warning" className="alert-notification mb-4 shadow-sm border-0">
          <div className="d-flex align-items-center">
            <FiAlertCircle className="me-2 flex-shrink-0" size={20} />
            <span className="flex-grow-1">{notif}</span>
            <Button
              size="sm"
              variant="outline-warning"
              className="ms-3"
              onClick={() => navigate('/admin/orders')}
            >
              Lihat Pesanan
            </Button>
          </div>
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <StatCard 
            icon={<FiFileText />} 
            title="Total Pesanan" 
            value={stats.orders} 
            color="#6366f1" 
            loading={loading}
            trend={getTrendIndicator(stats.orders, stats.orders * 0.8)}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard 
            icon={<FiTruck />} 
            title="Jumlah Mobil" 
            value={`${stats.availableCars}/${stats.cars}`} 
            color="#10b981" 
            loading={loading}
            trend={`${stats.cars > 0 ? Math.round((stats.availableCars / stats.cars) * 100) : 0}% tersedia`}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard 
            icon={<FiUsers />} 
            title="Pengguna" 
            value={stats.users} 
            color="#3b82f6" 
            loading={loading}
            trend={getTrendIndicator(stats.users, stats.users * 0.9)}
          />
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <StatCard 
            icon={<FiDollarSign />} 
            title="Total Pendapatan" 
            value={formatCurrency(stats.revenue)} 
            color="#f59e0b" 
            loading={loading}
            trend={getTrendIndicator(stats.revenue, stats.revenue * 0.85)}
          />
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-3 mb-4">
        <Col lg={4} md={12}>
          <ChartCard 
            title="Pesanan Bulanan" 
            icon={<FiTrendingUp />} 
            color="#6366f1" 
            loading={loading || !orderChart}
          >
            <ReactECharts 
              option={orderChart} 
              style={{ height: 250 }} 
              className="echarts-for-react-fix"
            />
          </ChartCard>
        </Col>
        <Col lg={4} md={6}>
          <ChartCard 
            title="Pendapatan Bulanan" 
            icon={<FiDollarSign />} 
            color="#10b981" 
            loading={loading || !revenueChart}
          >
            <ReactECharts 
              option={revenueChart} 
              style={{ height: 250 }} 
              className="echarts-for-react-fix"
            />
          </ChartCard>
        </Col>
        <Col lg={4} md={6}>
          <ChartCard 
            title="User Baru Bulanan" 
            icon={<FiUserPlus />} 
            color="#f59e0b" 
            loading={loading || !userChart}
          >
            <ReactECharts 
              option={userChart} 
              style={{ height: 250 }} 
              className="echarts-for-react-fix"
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Top Cars & Pie Chart */}
      <Row className="g-3 mb-4">
        <Col lg={6} md={12}>
          <ChartCard 
            title="Mobil Terlaris Bulan Ini" 
            icon={<FaCrown />} 
            color="#8b5cf6" 
            loading={loading}
          >
            <div className="top-cars-list">
              {topCars.length === 0 ? (
                <div className="text-center py-4 text-muted">Belum ada data.</div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {topCars.map((car, idx) => (
                    <div 
                      className={`top-car-item d-flex align-items-center p-3 rounded ${idx === 0 ? "top-car-highlight" : ""}`}
                      key={car.id}
                    >
                      <div className="top-car-rank me-3 d-flex align-items-center justify-content-center">
                        <span className="rank-number">{idx + 1}</span>
                        <FaCrown className={`rank-crown ${idx === 0 ? "gold" : idx === 1 ? "silver" : "bronze"}`} />
                      </div>
                      <img
                        src={car.gambar || "/images/car-placeholder.png"}
                        alt={car.nama}
                        className="me-3 rounded shadow-sm"
                        style={{ width: 80, height: 50, objectFit: "cover" }}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-bold">{car.nama}</div>
                        <div className="d-flex align-items-center mt-1">
                          <Badge bg="secondary" className="me-2">
                            {car.count}x disewa
                          </Badge>
                          <div className="text-muted small">
                            Omzet: <span className="fw-semibold">{formatCurrency(car.omzet)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ChartCard>
        </Col>
        <Col lg={6} md={12}>
          <ChartCard 
            title="Status Pesanan" 
            icon={<FiPieChart />} 
            color="#ec4899" 
            loading={loading}
          >
            <ReactECharts
  style={{ height: 250 }}
  option={{
    tooltip: { 
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: { 
      orient: 'horizontal', 
      bottom: 0,
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: 'Status Pesanan',
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '40%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: stats.pendingOrders, name: 'Pending' },
          { value: stats.paidOrders, name: 'Dibayar' },
          { value: stats.orders - stats.pendingOrders - stats.paidOrders, name: 'Lainnya' }
        ]
      }
    ],
    color: ['#f59e0b', '#10b981', '#6366f1']
  }}
  className="echarts-for-react-fix"
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Recent Orders & Users */}
      <Row className="g-3 mb-4">
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white border-0">
              <h5 className="card-title mb-0 fw-semibold d-flex align-items-center">
                <FiFileText className="me-2 text-primary" /> Pesanan Terbaru
              </h5>
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
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">ID Pesanan</th>
                      <th>Pelanggan</th>
                      <th>Total</th>
                      <th className="pe-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrders.map(order => (
                      <tr 
                        key={order.id} 
                        onClick={() => navigate(`/admin/orders/${order.id}`)} 
                        className="cursor-pointer"
                      >
                        <td className="ps-3 text-primary fw-semibold">#{order.id}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-2 bg-light text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                              {order.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="text-truncate" style={{ maxWidth: '100px' }}>
                              {order.user?.name || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="fw-semibold">{formatCurrency(order.total_price || 0)}</td>
                        <td className="pe-3">
                          <div className="d-flex flex-column gap-1">
                            {getPaymentBadge(order.payment_status)}
                            {getStatusBadge(order.status)}
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
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white border-0">
              <h5 className="card-title mb-0 fw-semibold d-flex align-items-center">
                <BsPeople className="me-2 text-primary" /> Pengguna Terbaru
              </h5>
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
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Nama</th>
                      <th>Email</th>
                      <th className="pe-3">Bergabung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestUsers.map(user => (
                      <tr 
                        key={user.id} 
                        onClick={() => navigate(`/admin/users/${user.id}`)} 
                        className="cursor-pointer"
                      >
                        <td className="ps-3">
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, fontWeight: 600 }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-truncate" style={{ maxWidth: '100px' }}>
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-truncate" style={{ maxWidth: '150px' }}>{user.email}</td>
                        <td className="pe-3">{formatDate(user.createdAt || user.created_at)}</td>
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
      <Row className="g-3 mb-4">
        <Col lg={12}>
          <ChartCard 
            title="Distribusi Penyewaan Mobil" 
            icon={<FaCar />} 
            color="#3b82f6" 
            loading={loading || !occupancyChart}
          >
            <ReactECharts 
              option={occupancyChart} 
              style={{ height: 350 }} 
              className="echarts-for-react-fix"
            />
          </ChartCard>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="g-3">
        <Col lg={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="fw-semibold bg-white border-0">Aksi Cepat</Card.Header>
            <Card.Body className="pt-0">
              <Row className="g-3">
                <Col xs={6} md={3}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Tambah Mobil Baru</Tooltip>}>
                    <Button
                      variant="outline-light"
                      className="w-100 d-flex flex-column align-items-center justify-content-center py-4 rounded shadow-sm quick-action-btn"
                      onClick={() => navigate('/admin/cars')}
                    >
                      <div className="action-icon mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: 48, height: 48 }}>
                        <FiPlusCircle size={24} />
                      </div>
                      <span className="fw-semibold">Tambah Mobil</span>
                    </Button>
                  </OverlayTrigger>
                </Col>
                <Col xs={6} md={3}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Kelola Pesanan</Tooltip>}>
                    <Button
                      variant="outline-light"
                      className="w-100 d-flex flex-column align-items-center justify-content-center py-4 rounded shadow-sm quick-action-btn"
                      onClick={() => navigate('/admin/orders')}
                    >
                      <div className="action-icon mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', width: 48, height: 48 }}>
                        <FiFileText size={24} />
                      </div>
                      <span className="fw-semibold">Kelola Pesanan</span>
                    </Button>
                  </OverlayTrigger>
                </Col>
                <Col xs={6} md={3}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Kelola Pengguna</Tooltip>}>
                    <Button
                      variant="outline-light"
                      className="w-100 d-flex flex-column align-items-center justify-content-center py-4 rounded shadow-sm quick-action-btn"
                      onClick={() => navigate('/admin/users')}
                    >
                      <div className="action-icon mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', width: 48, height: 48 }}>
                        <FiUsers size={24} />
                      </div>
                      <span className="fw-semibold">Kelola User</span>
                    </Button>
                  </OverlayTrigger>
                </Col>
                <Col xs={6} md={3}>
                  <OverlayTrigger placement="top" overlay={<Tooltip>Lihat Laporan</Tooltip>}>
                    <Button
                      variant="outline-light"
                      className="w-100 d-flex flex-column align-items-center justify-content-center py-4 rounded shadow-sm quick-action-btn"
                      onClick={() => navigate('/admin/report')}
                    >
                      <div className="action-icon mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', width: 48, height: 48 }}>
                        <FaChartBar size={24} />
                      </div>
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

  // State management
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
          marginLeft: sidebarCollapsed ? '70px' : '250px',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <div className="content">
          <div className="container-fluid p-0">
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
      <AdminAIChatbot 
        stats={stats} 
        omzet={stats.revenue} 
        orders={stats.orders} 
        users={stats.users} 
      />
    </div>
  );
};

export default AdminDashboard;