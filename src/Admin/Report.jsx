import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, Table, Spinner, Alert, Button, Badge, Row, Col, Form, Modal,
  ProgressBar, Dropdown, InputGroup, Toast, ToastContainer, Container
} from "react-bootstrap";
import {
  FiFileText, FiTruck, FiUsers, FiDollarSign, FiBarChart2, 
  FiSearch, FiCalendar, FiDownload, FiUser, FiCheckCircle,
  FiXCircle, FiClock, FiAlertCircle, FiFilter
} from "react-icons/fi";
import { 
  FaFilePdf, FaCar, FaFileCsv, FaUserShield, FaChartLine,
  FaMoneyBillWave, FaCarSide, FaCarCrash, FaCarAlt
} from "react-icons/fa";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import ReactECharts from "echarts-for-react";
import { API_URL } from "../utils/api"; // Tambahkan import ini

const StatCard = ({ icon, title, value, color, loading, darkMode }) => (
  <Card className={`stat-card shadow-sm mb-3 ${darkMode ? "bg-dark-2 text-light" : ""}`}>
    <Card.Body className="d-flex align-items-center">
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
      <div className="stat-content">
        <h6 className="stat-title mb-1 text-muted">{title}</h6>
        <h3 className="stat-value mb-0">
          {loading ? <Spinner animation="border" size="sm" /> : value}
        </h3>
      </div>
    </Card.Body>
  </Card>
);

const getFiturList = (fitur) => {
  if (!fitur) return [];
  if (Array.isArray(fitur)) return fitur;
  if (typeof fitur === "string") return fitur.split(",").map(f => f.trim()).filter(Boolean);
  return [];
};

const FiturBadges = ({ fitur, darkMode }) => {
  const fiturList = getFiturList(fitur);
  return fiturList.length > 0
    ? fiturList.map((f, i) => (
        <Badge key={i} bg={darkMode ? "info" : "primary"} className="me-1 mb-1">
          {f}
        </Badge>
      ))
    : <span className="text-muted">-</span>;
};

const StatusBadge = ({ status }) => {
  const variants = {
    completed: { bg: "success", text: "Selesai" },
    cancelled: { bg: "danger", text: "Dibatalkan" },
    confirmed: { bg: "info", text: "Dikonfirmasi" },
    pending: { bg: "warning", text: "Pending" },
    paid: { bg: "success", text: "Lunas" },
    pending_verification: { bg: "warning", text: "Menunggu" },
    rejected: { bg: "danger", text: "Ditolak" },
    available: { bg: "success", text: "Tersedia" },
    unavailable: { bg: "danger", text: "Tidak Tersedia" }
  };
  
  const { bg, text } = variants[status] || { bg: "secondary", text: status };
  return <Badge pill bg={bg}>{text}</Badge>;
};

const AdminReport = ({ darkMode, toggleDarkMode }) => {
  const [orders, setOrders] = useState([]);
  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [yearOptions, setYearOptions] = useState([new Date().getFullYear()]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [carFilter, setCarFilter] = useState("all");
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [modalOrders, setModalOrders] = useState([]);
  const [modalTitle, setModalTitle] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminStats, setAdminStats] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersRes, carsRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/orders/admin/all`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/layanan`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        
        const ordersData = Array.isArray(ordersRes.data.data) ? ordersRes.data.data : [];
        setOrders(ordersData);
        setCars(Array.isArray(carsRes.data.data) ? carsRes.data.data : []);
        setUsers(Array.isArray(usersRes.data.data)
          ? usersRes.data.data
          : (Array.isArray(usersRes.data.users) ? usersRes.data.users : []));

        // Generate year options from order data
        const years = [
          ...new Set(
            ordersData
              .map(o => moment(o.createdAt || o.created_at || o.order_date).year())
              .filter(y => !isNaN(y))
          ),
        ];
        const sortedYears = years.sort((a, b) => b - a);
        setYearOptions(sortedYears.length ? sortedYears : [new Date().getFullYear()]);
        if (!sortedYears.includes(year)) setYear(sortedYears[0] || new Date().getFullYear());
      } catch (err) {
        setOrders([]);
        setCars([]);
        setUsers([]);
        showToast("Gagal memuat data", "danger");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  // Filter orders by selected year, status, and car
  const filteredOrders = orders.filter(order => {
    const created = order.createdAt || order.created_at || order.order_date;
    const orderYear = created && moment(created).year();
    const matchYear = orderYear === Number(year);
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "paid"
        ? order.payment_status === "paid"
        : order.status === statusFilter);
    const matchCar =
      carFilter === "all" ||
      (order.layanan?.id?.toString() === carFilter || order.layanan_id?.toString() === carFilter);
    const matchSearch = searchQuery === "" || 
      (order.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.layanan?.nama || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toString().includes(searchQuery);
    return matchYear && matchStatus && matchCar && matchSearch;
  });

  // Paid orders for selected year
  const paidOrders = orders.filter(order => {
    const created = order.createdAt || order.created_at || order.order_date;
    const orderYear = created && moment(created).year();
    return order.payment_status === "paid" && orderYear === Number(year);
  });

  // Car sales statistics
  const carSales = {};
  paidOrders.forEach(order => {
    const car = order.layanan;
    if (!car || !car.id) return;
    if (!carSales[car.id]) {
      carSales[car.id] = {
        id: car.id,
        car: car.nama || "-",
        promo: car.promo || null,
        fitur: Array.isArray(car.fitur) ? car.fitur : (typeof car.fitur === "string" ? car.fitur.split(",").map(f => f.trim()).filter(Boolean) : []),
        count: 0,
        omzet: 0,
        orders: []
      };
    }
    carSales[car.id].count += 1;
    carSales[car.id].omzet += Number(order.total_price) || 0;
    carSales[car.id].orders.push(order);
  });
  const carSalesArr = Object.values(carSales).sort((a, b) => b.count - a.count);

  // Summary stats
  const totalOmzet = paidOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const totalOrders = paidOrders.length;
  const totalCars = cars.length;
  const totalUsers = users.length;

  // Monthly report
  const months = moment.monthsShort();
  const monthlyReport = Array(12).fill(0).map((_, i) => ({
    month: months[i],
    monthName: moment().month(i).format("MMMM"),
    orderCount: 0,
    omzet: 0,
    orders: []
  }));
  paidOrders.forEach(order => {
    const created = order.createdAt || order.created_at || order.order_date;
    if (created) {
      const date = moment(created);
      const idx = date.month();
      monthlyReport[idx].orderCount += 1;
      monthlyReport[idx].omzet += Number(order.total_price) || 0;
      monthlyReport[idx].orders.push(order);
    }
  });

  // Never rented cars
  const neverRentedCars = cars.filter(
    car => !paidOrders.some(order => (order.layanan?.id || order.layanan_id) === car.id)
  );

  // New users per month
  const userMonthly = Array(12).fill(0);
  users.forEach(user => {
    const created = user.createdAt || user.created_at;
    if (created && moment(created).year() === Number(year)) {
      userMonthly[moment(created).month()] += 1;
    }
  });

  // Admin performance
  const adminStatsArr = [];
  const adminUsers = users.filter(u => u.role === "admin");
  adminUsers.forEach(admin => {
    const adminOrders = paidOrders.filter(o => o.admin_id === admin.id);
    const adminOmzet = adminOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
    adminStatsArr.push({
      admin,
      orderCount: adminOrders.length,
      omzet: adminOmzet,
      orders: adminOrders
    });
  });

  // Available cars
  const availableCars = cars.filter(car => car.status === "available");
  const today = moment();
  const unavailableCars = cars.filter(car => {
    if (car.status !== 'available') return true;
    return orders.some(order =>
      (order.layanan?.id === car.id || order.layanan_id === car.id) &&
      ["pending", "confirmed"].includes(order.status) &&
      today.isSameOrAfter(moment(order.pickup_date), "day") &&
      today.isSameOrBefore(moment(order.return_date), "day")
    );
  });

  // Format currency
  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "Rp0";
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num).replace("IDR", "Rp");
  };

  // Cars currently rented
  const activeRentalOrders = orders.filter(order => {
    const pickup = moment(order.pickup_date || order.pickupDate);
    const ret = moment(order.return_date || order.returnDate);
    return (
      ["pending", "confirmed"].includes(order.status) &&
      today.isSameOrAfter(pickup, "day") &&
      today.isSameOrBefore(ret, "day")
    );
  });

  // Cars that will be rented
  const carsWillBeRented = orders.filter(order => {
    const pickup = moment(order.pickup_date || order.pickupDate);
    return (
      ["pending", "confirmed"].includes(order.status) &&
      pickup.isSameOrAfter(today, "day")
    );
  });

  // Export PDF
  const handleExportPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 10;

    doc.setFontSize(16);
    doc.text(`Laporan Penjualan & Statistik Tahun ${year}`, 14, y);
    y += 10;

    // Monthly sales report
    doc.setFontSize(12);
    doc.text("Rekap Penjualan per Bulan", 14, y);
    y += 6;
    autoTable(doc, {
      head: [["Bulan", "Jumlah Pesanan", "Total Omzet"]],
      body: monthlyReport.map(row => [
        row.monthName,
        row.orderCount.toString(),
        formatCurrency(row.omzet).replace("Rp", "Rp ")
      ]),
      startY: y,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 8;

    // Top selling cars
    doc.text("Mobil Terlaris", 14, y);
    y += 6;
    autoTable(doc, {
      head: [["Nama Mobil", "Jumlah Disewa", "Omzet"]],
      body: carSalesArr.map(car => [
        car.car,
        car.count,
        formatCurrency(car.omzet).replace("Rp", "Rp ")
      ]),
      startY: y,
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 8;

    // Never rented cars
    doc.text("Mobil Tidak Pernah Disewa", 14, y);
    y += 6;
    autoTable(doc, {
      head: [["Nama Mobil", "Kategori", "Status"]],
      body: neverRentedCars.map(car => [
        car.nama,
        car.kategori,
        car.status === "available" ? "Tersedia" : "Tidak Tersedia"
      ]),
      startY: y,
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 }
    });

    // Admin performance
    if (adminStatsArr.length > 0) {
      y = doc.lastAutoTable.finalY + 8;
      doc.text("Rekap Performa Admin", 14, y);
      y += 6;
      autoTable(doc, {
        head: [["Nama Admin", "Jumlah Pesanan", "Omzet"]],
        body: adminStatsArr.map(a => [
          a.admin.name,
          a.orderCount,
          formatCurrency(a.omzet).replace("Rp", "Rp ")
        ]),
        startY: y,
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });
    }

    doc.save(`laporan-penjualan-${year}.pdf`);
    showToast("PDF berhasil diunduh", "success");
  };

  // Export Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Monthly sales
    const ws1 = XLSX.utils.json_to_sheet(monthlyReport.map(row => ({
      Bulan: row.monthName,
      "Jumlah Pesanan": row.orderCount,
      "Total Omzet": row.omzet
    })));
    XLSX.utils.book_append_sheet(wb, ws1, "Rekap Bulanan");

    // Top selling cars
    const ws3 = XLSX.utils.json_to_sheet(carSalesArr.map(car => ({
      "Nama Mobil": car.car,
      "Jumlah Disewa": car.count,
      "Omzet": car.omzet
    })));
    XLSX.utils.book_append_sheet(wb, ws3, "Mobil Terlaris");

    // Never rented cars
    const ws4 = XLSX.utils.json_to_sheet(neverRentedCars.map(car => ({
      "Nama Mobil": car.nama,
      "Kategori": car.kategori,
      "Status": car.status === "available" ? "Tersedia" : "Tidak Tersedia"
    })));
    XLSX.utils.book_append_sheet(wb, ws4, "Mobil Tidak Pernah Disewa");

    // Admin performance
    if (adminStatsArr.length > 0) {
      const ws5 = XLSX.utils.json_to_sheet(adminStatsArr.map(a => ({
        "Nama Admin": a.admin.name,
        "Jumlah Pesanan": a.orderCount,
        "Omzet": a.omzet
      })));
      XLSX.utils.book_append_sheet(wb, ws5, "Performa Admin");
    }

    XLSX.writeFile(wb, `laporan-penjualan-${year}.xlsx`);
    showToast("Excel berhasil diunduh", "success");
  };

  // Show order details when chart is clicked
  const handleBarClick = (params, type = "month") => {
    if (!params || typeof params.dataIndex !== "number") return;
    if (type === "month") {
      const idx = params.dataIndex;
      setModalTitle(`Detail Pesanan Bulan ${months[idx]} ${year}`);
      setModalOrders(monthlyReport[idx].orders);
      setShowOrderModal(true);
    } else if (type === "car") {
      const idx = params.dataIndex;
      setModalTitle(`Detail Pesanan Mobil ${carSalesArr[idx].car} (${year})`);
      setModalOrders(carSalesArr[idx].orders);
      setShowOrderModal(true);
    }
  };

  // Download payment proof
  const handleDownloadBukti = (order) => {
    if (!order.payment_proof) {
      showToast("Bukti pembayaran tidak tersedia", "warning");
      return;
    }
    try {
      const url = order.payment_proof.startsWith("http")
        ? order.payment_proof
        : `${API_URL.replace(/\/api$/, "")}${order.payment_proof}`;
      const link = document.createElement("a");
      link.href = url;
      link.download = `bukti-pembayaran-${order.id}${url.endsWith('.pdf') ? '.pdf' : '.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Bukti pembayaran sedang diunduh", "info");
    } catch (err) {
      showToast("Gagal mengunduh bukti pembayaran", "danger");
    }
  };

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <Container fluid className="py-4 px-4">
        {/* Header */}
        <Row className="align-items-center mb-4">
          <Col xs={12} md={6}>
            <h2 className="mb-0 fw-bold">
              <FaChartLine className="me-2" />
              Dashboard Laporan Admin
            </h2>
            <p className="text-muted mb-0">Analisis dan statistik penyewaan mobil</p>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
            <div className="d-flex flex-wrap justify-content-md-end gap-2">
              <Button
                variant="success"
                className="fw-bold d-flex align-items-center"
                onClick={handleExportExcel}
                title="Export Excel"
              >
                <FaFileCsv className="me-2" /> Excel
              </Button>
              <Button
                variant="danger"
                className="fw-bold d-flex align-items-center"
                onClick={handleExportPDF}
                title="Export PDF"
              >
                <FaFilePdf className="me-2" /> PDF
              </Button>
              <Button
                variant="primary"
                className="fw-bold d-flex align-items-center"
                onClick={() => setShowAdminModal(true)}
                title="Rekap Performa Admin"
              >
                <FaUserShield className="me-2" /> Admin
              </Button>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col xs={12} md={6} lg={3}>
            <StatCard
              icon={<FiFileText size={24} />}
              title="Total Pesanan"
              value={totalOrders}
              color="#6366f1"
              loading={loading}
              darkMode={darkMode}
            />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <StatCard
              icon={<FiTruck size={24} />}
              title="Jumlah Mobil"
              value={totalCars}
              color="#10b981"
              loading={loading}
              darkMode={darkMode}
            />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <StatCard
              icon={<FiUsers size={24} />}
              title="Pengguna Terdaftar"
              value={totalUsers}
              color="#3b82f6"
              loading={loading}
              darkMode={darkMode}
            />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <StatCard
              icon={<FiDollarSign size={24} />}
              title="Total Omzet"
              value={formatCurrency(totalOmzet)}
              color="#f59e0b"
              loading={loading}
              darkMode={darkMode}
            />
          </Col>
        </Row>

        {/* Filter Section */}
        <Card className={`mb-4 shadow-sm ${darkMode ? "bg-dark-2" : ""}`}>
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col xs={12} md={4}>
                <InputGroup>
                  <InputGroup.Text className={darkMode ? "bg-dark border-dark" : ""}>
                    <FiSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Cari pelanggan/mobil/ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={darkMode ? "bg-dark border-dark text-light" : ""}
                  />
                </InputGroup>
              </Col>
              
              <Col xs={6} md={2}>
                <Form.Select
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className={darkMode ? "bg-dark border-dark text-light" : ""}
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Form.Select>
              </Col>
              
              <Col xs={6} md={2}>
                <Form.Select
                  value={carFilter}
                  onChange={e => setCarFilter(e.target.value)}
                  className={darkMode ? "bg-dark border-dark text-light" : ""}
                >
                  <option value="all">Semua Mobil</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>{car.nama}</option>
                  ))}
                </Form.Select>
              </Col>
              
              <Col xs={6} md={2}>
                <Form.Select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className={darkMode ? "bg-dark border-dark text-light" : ""}
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paid">Paid</option>
                </Form.Select>
              </Col>
              
              <Col xs={6} md={2}>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setYear(new Date().getFullYear());
                    setCarFilter("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="w-100"
                >
                  <FiFilter className="me-1" /> Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Sales Charts */}
        <Row className="g-4 mb-4">
          <Col xs={12} lg={8}>
            <Card className={`shadow-sm h-100 ${darkMode ? "bg-dark-2" : ""}`}>
              <Card.Header className={`fw-semibold ${darkMode ? "bg-dark-3 text-light" : "bg-light"}`}>
                <FaChartLine className="me-2" /> Omzet & User Baru {year}
              </Card.Header>
              <Card.Body>
                <div id="chart-penjualan" style={{ minHeight: 350 }}>
                  <ReactECharts
                    style={{ height: 350 }}
                    option={{
                      tooltip: { 
                        trigger: 'axis', 
                        backgroundColor: darkMode ? '#2d3748' : '#fff',
                        borderColor: darkMode ? '#4a5568' : '#ddd',
                        borderWidth: 1, 
                        textStyle: { color: darkMode ? '#fff' : '#222' } 
                      },
                      legend: { 
                        data: ['Omzet (Rp)', 'User Baru'], 
                        top: 30,
                        textStyle: { color: darkMode ? '#fff' : '#222' }
                      },
                      grid: { left: 80, right: 40, bottom: 60, top: 60 },
                      xAxis: {
                        type: 'category',
                        data: months,
                        boundaryGap: false,
                        axisLabel: { 
                          color: darkMode ? "#fff" : "#222", 
                          interval: 0, 
                          rotate: 30, 
                          fontSize: 14, 
                          margin: 16 
                        },
                        axisLine: { lineStyle: { color: darkMode ? '#4a5568' : '#ddd' } }
                      },
                      yAxis: [
                        {
                          type: 'value',
                          name: 'Omzet (Rp)',
                          position: 'left',
                          axisLabel: { 
                            formatter: value => `Rp${value.toLocaleString("id-ID")}`, 
                            color: darkMode ? "#fff" : "#222" 
                          },
                          splitLine: { lineStyle: { color: darkMode ? '#4a5568' : '#eee' } },
                          axisLine: { show: false }
                        },
                        {
                          type: 'value',
                          name: 'User Baru',
                          position: 'right',
                          axisLabel: { color: darkMode ? "#fff" : "#222" },
                          splitLine: { show: false },
                          axisLine: { show: false }
                        }
                      ],
                      series: [
                        {
                          name: 'Omzet (Rp)',
                          type: 'line',
                          data: monthlyReport.map(r => r.omzet),
                          yAxisIndex: 0,
                          smooth: true,
                          symbol: 'circle',
                          symbolSize: 10,
                          lineStyle: { width: 4, color: "#10b981" },
                          itemStyle: { color: "#10b981" },
                          areaStyle: { color: darkMode ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.10)" }
                        },
                        {
                          name: 'User Baru',
                          type: 'line',
                          data: userMonthly,
                          yAxisIndex: 1,
                          smooth: true,
                          symbol: 'circle',
                          symbolSize: 10,
                          lineStyle: { width: 4, color: "#f59e0b" },
                          itemStyle: { color: "#f59e0b" },
                          areaStyle: { color: darkMode ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.08)" }
                        }
                      ]
                    }}
                    theme={darkMode ? "dark" : undefined}
                    onEvents={{
                      'click': params => handleBarClick(params, "month")
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} lg={4}>
            <Card className={`shadow-sm h-100 border-0 rounded-4 ${darkMode ? "bg-dark-2" : ""}`}>
              <Card.Header className={`fw-semibold border-0 rounded-top-4 ${darkMode ? "bg-dark-3 text-light" : "bg-light"}`}>
                <FaCar className="me-2" /> Mobil Terlaris {year}
              </Card.Header>
              <Card.Body>
                <div id="chart-mobil" style={{ height: 260 }}>
                  <ReactECharts
                    style={{ height: 260 }}
                    option={{
                      tooltip: { 
                        trigger: 'axis',
                        backgroundColor: darkMode ? '#2d3748' : '#fff',
                        borderColor: darkMode ? '#4a5568' : '#ddd',
                        borderWidth: 1, 
                        textStyle: { color: darkMode ? '#fff' : '#222' }
                      },
                      grid: { left: 30, right: 10, bottom: 40, top: 30 },
                      xAxis: {
                        type: 'category',
                        data: carSalesArr.slice(0, 5).map(c => c.car),
                        axisLabel: {
                          rotate: 25,
                          interval: 0,
                          color: darkMode ? "#fff" : "#222",
                          fontSize: 13,
                          margin: 12
                        },
                        axisLine: { lineStyle: { color: darkMode ? '#4a5568' : '#ddd' } }
                      },
                      yAxis: {
                        type: 'value',
                        name: 'Jumlah Disewa',
                        axisLabel: { color: darkMode ? "#fff" : "#222" },
                        splitLine: { lineStyle: { color: darkMode ? '#4a5568' : '#eee', type: "dashed" } },
                        axisLine: { show: false }
                      },
                      series: [
                        {
                          name: 'Jumlah Disewa',
                          type: 'bar',
                          data: carSalesArr.slice(0, 5).map(c => c.count),
                          itemStyle: { 
                            color: "#6366f1", 
                            borderRadius: [8,8,0,0],
                            shadowColor: "#6366f1",
                            shadowBlur: 6
                          },
                          barWidth: 28
                        }
                      ]
                    }}
                    theme={darkMode ? "dark" : undefined}
                    onEvents={{
                      'click': params => handleBarClick(params, "car")
                    }}
                  />
                </div>
                
                <div className="mt-3">
                  <Table borderless hover responsive className={`align-middle mb-0 ${darkMode ? "table-dark" : ""}`}>
                    <thead>
                      <tr>
                        <th className="ps-2">Mobil</th>
                        <th className="text-end">Disewa</th>
                        <th className="text-end">Omzet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carSalesArr.slice(0, 5).map((car, idx) => (
                        <tr
                          key={car.id}
                          className="cursor-pointer"
                          style={{ transition: "background 0.15s" }}
                          onClick={() => handleBarClick({ dataIndex: idx }, "car")}
                          onMouseEnter={e => e.currentTarget.style.background = darkMode ? "#23272b" : "#f3f6fa"}
                          onMouseLeave={e => e.currentTarget.style.background = ""}
                        >
                          <td className="ps-2">
                            <div className="d-flex align-items-center">
                              <div className="me-2">
                                <FaCar className="text-muted" />
                              </div>
                              <div className="text-truncate" style={{ maxWidth: 120 }}>
                                {car.car}
                              </div>
                            </div>
                          </td>
                          <td className="text-end">
                            <Badge bg="info" pill>{car.count}</Badge>
                          </td>
                          <td className="text-end">
                            <span className="fw-bold text-success">
                              {formatCurrency(car.omzet)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Car Status Cards */}
        <Row className="g-4 mb-4">
          <Col xs={12} md={6} lg={3}>
            <Card className={`shadow-sm h-100 ${darkMode ? "bg-dark-2" : ""}`}>
              <Card.Header className={`fw-semibold ${darkMode ? "bg-dark-3 text-light" : "bg-light"}`}>
                <FaCarAlt className="me-2 text-success" /> Mobil Tersedia
              </Card.Header>
              <Card.Body>
                {availableCars.length === 0 ? (
                  <Alert variant="info" className="mb-0">Tidak ada mobil tersedia</Alert>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {availableCars.slice(0, 3).map(car => (
                      <div key={car.id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                        <div className="text-truncate" style={{ maxWidth: 120 }}>
                          {car.nama}
                        </div>
                        <div>
                          {car.promo ? (
                            <Badge bg="warning" className="text-dark">{car.promo}%</Badge>
                          ) : null}
                        </div>
                      </div>
                    ))}
                    {availableCars.length > 3 && (
                      <div className="text-center text-muted">
                        +{availableCars.length - 3} mobil lainnya
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} md={6} lg={3}>
            <Card className={`shadow-sm h-100 ${darkMode ? "bg-dark-2" : ""}`}>
              <Card.Header className={`fw-semibold ${darkMode ? "bg-dark-3 text-light" : "bg-light"}`}>
                <FaCarCrash className="me-2 text-danger" /> Mobil Tidak Tersedia
              </Card.Header>
              <Card.Body>
                {unavailableCars.length === 0 ? (
                  <Alert variant="success" className="mb-0">Semua mobil tersedia</Alert>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {unavailableCars.slice(0, 3).map(car => (
                      <div key={car.id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                        <div className="text-truncate" style={{ maxWidth: 120 }}>
                          {car.nama}
                        </div>
                        <div>
                          <StatusBadge status={car.status} />
                        </div>
                      </div>
                    ))}
                    {unavailableCars.length > 3 && (
                      <div className="text-center text-muted">
                        +{unavailableCars.length - 3} mobil lainnya
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} md={6} lg={3}>
            <Card className={`shadow-sm h-100 ${darkMode ? "bg-dark-2" : ""}`}>
              <Card.Header className={`fw-semibold ${darkMode ? "bg-dark-3 text-light" : "bg-light"}`}>
                <FaCarSide className="me-2 text-primary" /> Sedang Disewa
              </Card.Header>
              <Card.Body>
                {activeRentalOrders.length === 0 ? (
                  <Alert variant="info" className="mb-0">Tidak ada mobil disewa hari ini</Alert>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {activeRentalOrders.slice(0, 3).map(order => {
                      const car = cars.find(c => c.id === (order.layanan?.id || order.layanan_id));
                      return (
                        <div key={order.id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                          <div className="text-truncate" style={{ maxWidth: 120 }}>
                            {car?.nama || "-"}
                          </div>
                          <div>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                      );
                    })}
                    {activeRentalOrders.length > 3 && (
                      <div className="text-center text-muted">
                        +{activeRentalOrders.length - 3} mobil lainnya
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col xs={12} md={6} lg={3}>
            <Card className={`shadow-sm h-100 ${darkMode ? "bg-dark-2" : ""}`}>
              <Card.Header className={`fw-semibold ${darkMode ? "bg-dark-3 text-light" : "bg-light"}`}>
                <FiCalendar className="me-2 text-warning" /> Akan Disewa
              </Card.Header>
              <Card.Body>
                {carsWillBeRented.length === 0 ? (
                  <Alert variant="info" className="mb-0">Tidak ada mobil akan disewa</Alert>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {carsWillBeRented.slice(0, 3).map(order => {
                      const car = cars.find(c => c.id === (order.layanan?.id || order.layanan_id));
                      return (
                        <div key={order.id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                          <div className="text-truncate" style={{ maxWidth: 120 }}>
                            {car?.nama || "-"}
                          </div>
                          <div>
                            <StatusBadge status={order.status} />
                          </div>
                        </div>
                      );
                    })}
                    {carsWillBeRented.length > 3 && (
                      <div className="text-center text-muted">
                        +{carsWillBeRented.length - 3} mobil lainnya
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Never Rented Cars */}
        <Card className={`mb-4 shadow-sm ${darkMode ? "bg-dark-2" : ""}`}>
          <Card.Header className={`fw-semibold ${darkMode ? "bg-dark-3 text-light" : "bg-light"}`}>
            <FiAlertCircle className="me-2 text-warning" /> Mobil Tidak Pernah Disewa {year}
          </Card.Header>
          <Card.Body>
            {neverRentedCars.length === 0 ? (
              <Alert variant="success">Semua mobil pernah disewa tahun ini.</Alert>
            ) : (
              <div className="table-responsive">
                <Table hover className={darkMode ? "table-dark" : ""}>
                  <thead>
                    <tr>
                      <th>Nama Mobil</th>
                      <th>Kategori</th>
                      <th>Status</th>
                      <th>Promo</th>
                      <th>Fitur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {neverRentedCars.map(car => (
                      <tr key={car.id}>
                        <td>{car.nama}</td>
                        <td>{car.kategori || "-"}</td>
                        <td>
                          <StatusBadge status={car.status} />
                        </td>
                        <td>
                          {car.promo ? (
                            <Badge bg="warning" className="text-dark">{car.promo}%</Badge>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          <FiturBadges fitur={car.fitur} darkMode={darkMode} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Order List */}
        <Card className={`mb-4 shadow-sm ${darkMode ? "bg-dark-2" : ""}`}>
          <Card.Header className={`fw-semibold ${darkMode ? "bg-dark-3 text-light" : "bg-light"}`}>
            <FiFileText className="me-2" /> Daftar Pesanan ({filteredOrders.length})
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              {filteredOrders.length === 0 ? (
                <Alert variant="info">Tidak ada pesanan yang sesuai dengan filter.</Alert>
              ) : (
                <Table hover className={darkMode ? "table-dark" : ""}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Pelanggan</th>
                      <th>Mobil</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                      <th>Pembayaran</th>
                      <th>Total</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.user?.name || order.User?.name || "-"}</td>
                        <td>{order.layanan?.nama || order.Layanan?.nama || "-"}</td>
                        <td>
                          {moment(order.createdAt || order.created_at || order.order_date).format("D MMM YYYY")}
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td>
                          <StatusBadge status={order.payment_status} />
                        </td>
                        <td>
                          {formatCurrency(order.total_price)}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant={darkMode ? "outline-light" : "outline-primary"}
                            onClick={() => {
                              setModalTitle(`Detail Pesanan #${order.id}`);
                              setModalOrders([order]);
                              setShowOrderModal(true);
                            }}
                          >
                            Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Order Detail Modal */}
        <Modal
          show={showOrderModal}
          onHide={() => setShowOrderModal(false)}
          size="lg"
          centered
          contentClassName={darkMode ? "bg-dark-2 text-light" : ""}
        >
          <Modal.Header closeButton className={darkMode ? "border-dark" : ""}>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalOrders.length === 0 ? (
              <Alert variant="info">Tidak ada detail pesanan.</Alert>
            ) : (
              <div className="table-responsive">
                <Table bordered hover className={darkMode ? "table-dark" : ""}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Pelanggan</th>
                      <th>Mobil</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                      <th>Pembayaran</th>
                      <th>Total</th>
                      <th>Bukti</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.user?.name || order.User?.name || "-"}</td>
                        <td>{order.layanan?.nama || order.Layanan?.nama || "-"}</td>
                        <td>
                          {moment(order.createdAt || order.created_at || order.order_date).format("D MMM YYYY")}
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td>
                          <StatusBadge status={order.payment_status} />
                        </td>
                        <td>
                          {formatCurrency(order.total_price)}
                        </td>
                        <td>
                          {order.payment_proof ? (
                            <Button
                              size="sm"
                              variant={darkMode ? "outline-light" : "outline-primary"}
                              onClick={() => handleDownloadBukti(order)}
                              title="Download Bukti"
                            >
                              <FiDownload />
                            </Button>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className={darkMode ? "border-dark" : ""}>
            <Button 
              variant={darkMode ? "outline-light" : "outline-secondary"}
              onClick={() => setShowOrderModal(false)}
            >
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Admin Performance Modal */}
        <Modal
          show={showAdminModal}
          onHide={() => setShowAdminModal(false)}
          size="lg"
          centered
          contentClassName={darkMode ? "bg-dark-2 text-light" : ""}
        >
          <Modal.Header closeButton className={darkMode ? "border-dark" : ""}>
            <Modal.Title>Rekap Performa Admin ({year})</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {adminStatsArr.length === 0 ? (
              <Alert variant="info">Belum ada data admin atau pesanan belum ada yang diproses admin.</Alert>
            ) : (
              <div className="table-responsive">
                <Table bordered hover className={darkMode ? "table-dark" : ""}>
                  <thead>
                    <tr>
                      <th>Nama Admin</th>
                      <th>Email</th>
                      <th>Jumlah Pesanan</th>
                      <th>Omzet</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminStatsArr.map((a, idx) => (
                      <tr key={a.admin.id}>
                        <td>{a.admin.name}</td>
                        <td>{a.admin.email}</td>
                        <td>
                          <Badge bg="info">{a.orderCount}</Badge>
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            {formatCurrency(a.omzet)}
                          </span>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant={darkMode ? "outline-light" : "outline-primary"}
                            onClick={() => {
                              setModalTitle(`Detail Pesanan oleh ${a.admin.name} (${year})`);
                              setModalOrders(a.orders);
                              setShowOrderModal(true);
                            }}
                          >
                            Detail
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className={darkMode ? "border-dark" : ""}>
            <Button 
              variant={darkMode ? "outline-light" : "outline-secondary"}
              onClick={() => setShowAdminModal(false)}
            >
              Tutup
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Toast Notification */}
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
          <Toast
            show={toast.show}
            onClose={() => setToast({ ...toast, show: false })}
            bg={toast.variant}
            delay={3000}
            autohide
            className={darkMode ? "bg-dark-2" : ""}
          >
            <Toast.Body className="d-flex align-items-center">
              {toast.variant === "success" ? (
                <FiCheckCircle className="me-2 flex-shrink-0" />
              ) : (
                <FiAlertCircle className="me-2 flex-shrink-0" />
              )}
              <span className="flex-grow-1">{toast.message}</span>
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </div>
  );
};

export default AdminReport;