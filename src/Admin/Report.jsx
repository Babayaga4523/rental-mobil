import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, Table, Spinner, Alert, Button, Badge, Row, Col, Form, Modal
} from "react-bootstrap";
import {
  FiFileText, FiTruck, FiUsers, FiDollarSign,
  FiBarChart2, FiSearch, FiSun, FiMoon
} from "react-icons/fi";
import { FaFilePdf, FaCar, FaFileCsv, FaDownload, FaUserShield } from "react-icons/fa";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import ReactECharts from "echarts-for-react";

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

const getFiturList = (fitur) => {
  if (!fitur) return [];
  if (Array.isArray(fitur)) return fitur;
  if (typeof fitur === "string") return fitur.split(",").map(f => f.trim()).filter(Boolean);
  return [];
};

const FiturBadges = ({ fitur }) => {
  const fiturList = getFiturList(fitur);
  return fiturList.length > 0
    ? fiturList.map((f, i) => (
        <Badge key={i} bg="info" className="me-1 mb-1">{f}</Badge>
      ))
    : <span className="text-muted">-</span>;
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
      } catch {
        setOrders([]);
        setCars([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [token]);

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
    return matchYear && matchStatus && matchCar;
  });

  // Ambil order completed tahun 2025
  const completedOrders2025 = orders.filter(order => {
    const created = order.createdAt || order.created_at || order.order_date;
    const orderYear = created && moment(created).year();
    return order.status === "completed" && orderYear === 2025;
  });

  // Hitung jumlah order & omzet per mobil
  const carSales = {};
  completedOrders2025.forEach(order => {
    const carId = order.layanan?.id || order.layanan_id;
    if (!carId) return;
    if (!carSales[carId]) {
      carSales[carId] = {
        car: order.layanan?.nama || "-",
        count: 0,
        omzet: 0,
        orders: []
      };
    }
    carSales[carId].count += 1;
    carSales[carId].omzet += Number(order.total_price) || 0;
    carSales[carId].orders.push(order);
  });
  const carSalesArr = Object.values(carSales).sort((a, b) => b.count - a.count);

  // Untuk grafik
  const chartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, bottom: 60, top: 40 },
    xAxis: {
      type: 'category',
      data: carSalesArr.map(c => c.car),
      axisLabel: {
        rotate: 30,
        color: darkMode ? "#fff" : "#222",
        fontSize: 13,
        margin: 14
      }
    },
    yAxis: {
      type: 'value',
      name: 'Jumlah Disewa',
      axisLabel: { color: darkMode ? "#fff" : "#222" }
    },
    series: [
      {
        name: 'Jumlah Disewa',
        type: 'bar',
        data: carSalesArr.map(c => c.count),
        itemStyle: { color: "#6366f1", borderRadius: [8,8,0,0] },
        barWidth: 32
      }
    ]
  };

  // Rekap total
  const totalOmzet = filteredOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const totalOrders = filteredOrders.length;
  const totalCars = cars.length;
  const totalUsers = users.length;

  // Rekap per bulan
  const months = moment.monthsShort();
  const monthlyReport = Array(12).fill(0).map((_, i) => ({
    month: months[i],
    orderCount: 0,
    omzet: 0,
    orders: []
  }));
  filteredOrders.forEach(order => {
    const created = order.createdAt || order.created_at || order.order_date;
    if (created) {
      const date = moment(created);
      const idx = date.month();
      monthlyReport[idx].orderCount += 1;
      monthlyReport[idx].omzet += Number(order.total_price) || 0;
      monthlyReport[idx].orders.push(order);
    }
  });

  // Mobil terlaris
  filteredOrders.forEach(order => {
    const carId = order.layanan?.id || order.layanan_id;
    if (!carId) return;
    if (!carSales[carId]) {
      carSales[carId] = {
        car: order.layanan?.nama || "-",
        count: 0,
        omzet: 0,
        orders: []
      };
    }
    carSales[carId].count += 1;
    carSales[carId].omzet += Number(order.total_price) || 0;
    carSales[carId].orders.push(order);
  });
 

  // Mobil tidak pernah disewa
  const neverRentedCars = cars.filter(
    car => !filteredOrders.some(order => (order.layanan?.id || order.layanan_id) === car.id)
  );

  // Statistik user baru per bulan
  const userMonthly = Array(12).fill(0);
  users.forEach(user => {
    const created = user.createdAt || user.created_at;
    if (created && moment(created).year() === Number(year)) {
      userMonthly[moment(created).month()] += 1;
    }
  });

  // Rekap performa admin (jika multi-admin)
  const adminStatsArr = [];
  const adminUsers = users.filter(u => u.role === "admin");
  adminUsers.forEach(admin => {
    const adminOrders = filteredOrders.filter(o => o.admin_id === admin.id);
    const adminOmzet = adminOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
    adminStatsArr.push({
      admin,
      orderCount: adminOrders.length,
      omzet: adminOmzet,
      orders: adminOrders
    });
  });

  // Export PDF
  const handleExportPDF = async () => {
    const doc = new jsPDF("p", "mm", "a4");
    let y = 10;

    doc.setFontSize(16);
    doc.text(`Laporan Penjualan & Statistik Tahun ${year}`, 14, y);
    y += 10;

    // Rekap Penjualan per Bulan
    doc.setFontSize(12);
    doc.text("Rekap Penjualan per Bulan", 14, y);
    y += 6;
    autoTable(doc, {
      head: [["Bulan", "Jumlah Pesanan", "Total Omzet"]],
      body: monthlyReport.map(row => [
        row.month,
        row.orderCount.toString(),
        "Rp " + row.omzet.toLocaleString("id-ID")
      ]),
      startY: y,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 8;

    // Grafik Penjualan per Bulan
    const chart1 = document.querySelector("#chart-penjualan canvas");
    if (chart1) {
      const imgData = await html2canvas(chart1).then(c => c.toDataURL("image/png"));
      doc.text("Grafik Penjualan per Bulan", 14, y);
      y += 4;
      doc.addImage(imgData, "PNG", 14, y, 180, 40);
      y += 45;
    }

    // Mobil Terlaris
    doc.text("Mobil Terlaris", 14, y);
    y += 6;
    autoTable(doc, {
      head: [["Nama Mobil", "Jumlah Disewa", "Omzet"]],
      body: carSalesArr.map(car => [
        car.car,
        car.count,
        "Rp" + car.omzet.toLocaleString("id-ID")
      ]),
      startY: y,
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 8;

    // Grafik Mobil Terlaris
    const chart2 = document.querySelector("#chart-mobil canvas");
    if (chart2) {
      const imgData = await html2canvas(chart2, { backgroundColor: "#fff" }).then(c => c.toDataURL("image/png"));
      doc.text("Grafik Mobil Terlaris", 14, y);
      y += 4;
      doc.addImage(imgData, "PNG", 14, y, 180, 60);
      y += 65;
    }

    // Mobil Tidak Pernah Disewa
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

    // Performa Admin
    if (adminStatsArr.length > 0) {
      y = doc.lastAutoTable.finalY + 8;
      doc.text("Rekap Performa Admin", 14, y);
      y += 6;
      autoTable(doc, {
        head: [["Nama Admin", "Jumlah Pesanan", "Omzet"]],
        body: adminStatsArr.map(a => [
          a.admin.name,
          a.orderCount,
          "Rp" + a.omzet.toLocaleString("id-ID")
        ]),
        startY: y,
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 }
      });
    }

    doc.save(`laporan-penjualan-${year}.pdf`);
  };

  // Export Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Rekap Penjualan per Bulan
    const ws1 = XLSX.utils.json_to_sheet(monthlyReport.map(row => ({
      Bulan: row.month,
      "Jumlah Pesanan": row.orderCount,
      "Total Omzet": row.omzet
    })));
    XLSX.utils.book_append_sheet(wb, ws1, "Rekap Bulanan");

    // Sheet 2: Mobil Terlaris
    const ws3 = XLSX.utils.json_to_sheet(carSalesArr.map(car => ({
      "Nama Mobil": car.car,
      "Jumlah Disewa": car.count,
      "Omzet": car.omzet
    })));
    XLSX.utils.book_append_sheet(wb, ws3, "Mobil Terlaris");

    // Sheet 3: Mobil Tidak Pernah Disewa
    const ws4 = XLSX.utils.json_to_sheet(neverRentedCars.map(car => ({
      "Nama Mobil": car.nama,
      "Kategori": car.kategori,
      "Status": car.status === "available" ? "Tersedia" : "Tidak Tersedia"
    })));
    XLSX.utils.book_append_sheet(wb, ws4, "Mobil Tidak Pernah Disewa");

    // Sheet 4: Performa Admin
    if (adminStatsArr.length > 0) {
      const ws5 = XLSX.utils.json_to_sheet(adminStatsArr.map(a => ({
        "Nama Admin": a.admin.name,
        "Jumlah Pesanan": a.orderCount,
        "Omzet": a.omzet
      })));
      XLSX.utils.book_append_sheet(wb, ws5, "Performa Admin");
    }

    XLSX.writeFile(wb, `laporan-penjualan-${year}.xlsx`);
  };

  // Tampilkan detail order saat klik chart
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

  // Download bukti pembayaran
  const handleDownloadBukti = (order) => {
    if (!order.payment_proof) return;
    const url = order.payment_proof.startsWith("http")
      ? order.payment_proof
      : `http://localhost:3000${order.payment_proof}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `bukti-pembayaran-${order.id}${url.endsWith('.pdf') ? '.pdf' : '.jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mobil tersedia & tidak tersedia
  const availableCars = cars.filter(car => car.status === "available");
  const today = moment();
  const unavailableCars = cars.filter(car => {
    // Status mobil bukan available
    if (car.status !== 'available') return true;
    // Atau sedang disewa hari ini (ada order aktif hari ini)
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
    }).format(num);
  };

  // Mobil yang sedang disewa (status aktif & tanggal hari ini di range sewa)
  const activeRentalOrders = orders.filter(order => {
    const pickup = moment(order.pickup_date || order.pickupDate);
    const ret = moment(order.return_date || order.returnDate);
    return (
      ["pending", "confirmed"].includes(order.status) &&
      today.isSameOrAfter(pickup, "day") &&
      today.isSameOrBefore(ret, "day")
    );
  });

  // Gabungkan dengan data mobil
  const carsOnRent = orders.filter(order => {
    const pickup = moment(order.pickup_date || order.pickupDate);
    const ret = moment(order.return_date || order.returnDate);
    return (
      ["pending", "confirmed"].includes(order.status) &&
      today.isSameOrAfter(pickup, "day") &&
      today.isSameOrBefore(ret, "day")
    );
  }).map(order => {
    const car = cars.find(c => c.id === (order.layanan?.id || order.layanan_id));
    return {
      orderId: order.id,
      carName: car?.nama || "-",
      userName: order.user?.name || order.User?.name || "-",
      pickupDate: order.pickup_date,
      returnDate: order.return_date,
      status: order.status
    };
  });

  // Mobil yang akan disewa (sudah dipesan, pickup_date >= hari ini, status pending/confirmed)
  const carsWillBeRented = orders.filter(order => {
    const pickup = moment(order.pickup_date || order.pickupDate);
    return (
      ["pending", "confirmed"].includes(order.status) &&
      pickup.isSameOrAfter(today, "day")
    );
  }).map(order => {
    const car = cars.find(c => c.id === (order.layanan?.id || order.layanan_id));
    return {
      orderId: order.id,
      carName: car?.nama || "-",
      userName: order.user?.name || order.User?.name || "-",
      pickupDate: order.pickup_date,
      returnDate: order.return_date,
      status: order.status
    };
  });

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <div className="container-fluid py-4">
        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <StatCard
              icon={<FiFileText size={24} />}
              title="Total Pesanan"
              value={totalOrders}
              color="#6366f1"
              loading={loading}
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard
              icon={<FiTruck size={24} />}
              title="Jumlah Mobil"
              value={totalCars}
              color="#10b981"
              loading={loading}
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard
              icon={<FiUsers size={24} />}
              title="Pengguna Terdaftar"
              value={totalUsers}
              color="#3b82f6"
              loading={loading}
            />
          </div>
          <div className="col-md-6 col-lg-3">
            <StatCard
              icon={<FiDollarSign size={24} />}
              title="Total Omzet"
              value={formatCurrency(totalOmzet)}
              color="#f59e0b"
              loading={loading}
            />
          </div>
        </div>

        {/* Filter */}
        <Row className="align-items-center mb-4 g-2">
          <Col xs={12} md={4} className="mb-2 mb-md-0">
            <h4 className="mb-0 d-flex align-items-center" style={{ whiteSpace: "nowrap" }}>
              <FiBarChart2 className="me-2" />
              Laporan Penjualan & Statistik
            </h4>
          </Col>
          <Col xs={12} md={8}>
            <div className="d-flex flex-column flex-md-row flex-wrap align-items-stretch align-items-md-center gap-2">
              <Form.Select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                style={{ maxWidth: 110 }}
                className={darkMode ? "bg-dark text-light" : ""}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Form.Select>
              <Form.Select
                value={carFilter}
                onChange={e => setCarFilter(e.target.value)}
                style={{ maxWidth: 180 }}
                className={darkMode ? "bg-dark text-light" : ""}
              >
                <option value="all">Semua Mobil</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>{car.nama}</option>
                ))}
              </Form.Select>
              <Form.Select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ maxWidth: 140 }}
                className={darkMode ? "bg-dark text-light" : ""}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="paid">Paid</option>
              </Form.Select>
              <Button
                variant="success"
                className="fw-bold d-flex align-items-center"
                onClick={handleExportExcel}
                title="Export Excel"
                style={{ minWidth: 90, justifyContent: "center" }}
              >
                <FaFileCsv className="me-2" /> Excel
              </Button>
              <Button
                variant="danger"
                className="fw-bold d-flex align-items-center"
                onClick={handleExportPDF}
                title="Export PDF"
                style={{ minWidth: 90, justifyContent: "center" }}
              >
                <FaFilePdf className="me-2" /> PDF
              </Button>
              <Button
                variant="secondary"
                className="fw-bold d-flex align-items-center"
                onClick={() => setShowAdminModal(true)}
                title="Rekap Performa Admin"
                style={{ minWidth: 90, justifyContent: "center" }}
              >
                <FaUserShield className="me-2" /> Admin
              </Button>
              <Button
                variant={darkMode ? "light" : "dark"}
                onClick={toggleDarkMode}
                title={darkMode ? "Light Mode" : "Dark Mode"}
                className="d-flex align-items-center"
                style={{ minWidth: 40, justifyContent: "center" }}
              >
                {darkMode ? <FiSun /> : <FiMoon />}
              </Button>
            </div>
          </Col>
        </Row>

        {/* Grafik Penjualan & Omzet */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span>Grafik Omzet & User Baru {year}</span>
          </Card.Header>
          <Card.Body>
            <div id="chart-penjualan" style={{ minHeight: 350, width: "100%", overflowX: "auto" }}>
              <ReactECharts
                style={{ height: 350 }}
                option={{
                  tooltip: {
                    trigger: 'axis',
                    backgroundColor: '#fff',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    textStyle: { color: '#222' }
                  },
                  legend: {
                    data: ['Omzet (Rp)', 'User Baru'],
                    top: 30 // beri ruang lebih
                  },
                  grid: { left: 100, right: 40, bottom: 60, top: 60 }, // left diperbesar agar teks pojok kiri tidak terpotong
                  xAxis: {
                    type: 'category',
                    data: months,
                    boundaryGap: false,
                    axisLabel: {
                      color: darkMode ? "#fff" : "#222",
                      interval: 0,
                      rotate: 30, // miringkan label agar tidak kepotong
                      fontSize: 14,
                      margin: 16
                    }
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
                      splitLine: { lineStyle: { color: "#eee" } }
                    },
                    {
                      type: 'value',
                      name: 'User Baru',
                      position: 'right',
                      axisLabel: { color: darkMode ? "#fff" : "#222" },
                      splitLine: { show: false }
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
                      areaStyle: { color: "rgba(16,185,129,0.10)" }
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
                      areaStyle: { color: "rgba(245,158,11,0.08)" }
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

        {/* Mobil Terlaris */}
        <Card className="mb-4 shadow-sm">
          <Card.Header className="d-flex align-items-center">
            <FaCar className="me-2" /> Grafik Mobil Terlaris {year}
          </Card.Header>
          <Card.Body>
            <Row>
              <Col xs={12} md={7}>
                <div className="table-responsive">
                  <Table striped bordered hover className={darkMode ? "table-dark" : ""}>
                    <thead>
                      <tr>
                        <th>Nama Mobil</th>
                        <th>Promo</th>
                        <th>Fitur</th>
                        <th>Jumlah Disewa</th>
                        <th>Omzet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {carSalesArr.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center">Belum ada data penjualan.</td>
                        </tr>
                      ) : (
                        <>
                          {carSalesArr.map((car, idx) => {
                            const carDetail = cars.find(c => c.nama === car.car);
                            return (
                              <tr key={idx}>
                                <td>
                                  <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => handleBarClick({ dataIndex: idx }, "car")}
                                  >
                                    {car.car}
                                  </Button>
                                </td>
                                <td>
                                  {carDetail?.promo
                                    ? <Badge bg="warning" className="text-dark">{carDetail.promo}%</Badge>
                                    : <span className="text-muted">-</span>}
                                </td>
                                <td><FiturBadges fitur={carDetail?.fitur} /></td>
                                <td>
                                  <Badge bg="info">{car.count}</Badge>
                                </td>
                                <td>
                                  <span className="fw-bold text-success">
                                    {formatCurrency(car.omzet)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Col>
              <Col xs={12} md={5} className="d-flex align-items-center mt-3 mt-md-0">
                <div id="chart-mobil" style={{ width: "100%", minHeight: 320 }}>
                  <ReactECharts
                    style={{ height: 320 }}
                    option={{
                      tooltip: { trigger: 'axis' },
                      grid: { left: 40, right: 20, bottom: 60, top: 40 }, // tambah bottom
                      xAxis: {
                        type: 'category',
                        data: carSalesArr.map(c => c.car),
                        axisLabel: {
                          rotate: 30,
                          interval: 0,
                          color: darkMode ? "#fff" : "#222",
                          fontSize: 13,
                          margin: 14
                        }
                      },
                      yAxis: {
                        type: 'value',
                        name: 'Jumlah Disewa',
                        axisLabel: { color: darkMode ? "#fff" : "#222" }
                      },
                      series: [
                        {
                          name: 'Jumlah Disewa',
                          type: 'bar',
                          data: carSalesArr.map(c => c.count),
                          itemStyle: { color: "#6366f1", borderRadius: [8,8,0,0] },
                          barWidth: 32
                        }
                      ]
                    }}
                    theme={darkMode ? "dark" : undefined}
                    onEvents={{
                      'click': params => handleBarClick(params, "car")
                    }}
                  />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Mobil Tidak Pernah Disewa */}
        <Card className="mb-4">
          <Card.Header>
            <FiSearch className="me-2" /> Mobil Tidak Pernah Disewa {year}
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              {neverRentedCars.length === 0 ? (
                <Alert variant="success">Semua mobil pernah disewa tahun ini.</Alert>
              ) : (
                <Table striped bordered hover className={darkMode ? "table-dark" : ""}>
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
                        <td>{car.kategori}</td>
                        <td>
                          <Badge bg={car.status === "available" ? "success" : "danger"}>
                            {car.status === "available" ? "Tersedia" : "Tidak Tersedia"}
                          </Badge>
                        </td>
                        <td>
                          {car.promo
                            ? <Badge bg="warning" className="text-dark">{car.promo}%</Badge>
                            : <span className="text-muted">-</span>}
                        </td>
                        <td>
                          {Array.isArray(car.fitur) && car.fitur.length > 0
                            ? car.fitur.map((f, i) => (
                                <Badge key={i} bg="info" className="me-1">{f}</Badge>
                              ))
                            : <span className="text-muted">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Mobil Tersedia */}
        <Card className="mb-4">
          <Card.Header>
            <FaCar className="me-2" /> Daftar Mobil Tersedia
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              {availableCars.length === 0 ? (
                <Alert variant="danger">Tidak ada mobil yang tersedia.</Alert>
              ) : (
                <Table striped bordered hover className={darkMode ? "table-dark" : ""}>
                  <thead>
                    <tr>
                      <th>Nama Mobil</th>
                      <th>Kategori</th>
                      <th>Promo</th>
                      <th>Fitur</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableCars.map(car => (
                      <tr key={car.id}>
                        <td>{car.nama}</td>
                        <td>{car.kategori}</td>
                        <td>
                          {car.promo
                            ? <Badge bg="warning" className="text-dark">{car.promo}%</Badge>
                            : <span className="text-muted">-</span>}
                        </td>
                        <td>
                          {Array.isArray(car.fitur) && car.fitur.length > 0
                            ? car.fitur.map((f, i) => (
                                <Badge key={i} bg="info" className="me-1">{f}</Badge>
                              ))
                            : <span className="text-muted">-</span>}
                        </td>
                        <td>
                          <Badge bg="success">Tersedia</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Mobil Tidak Tersedia */}
        <Card className="mb-4">
          <Card.Header>
            <FaCar className="me-2" /> Daftar Mobil Tidak Tersedia
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              {unavailableCars.length === 0 ? (
                <Alert variant="success">Semua mobil tersedia.</Alert>
              ) : (
                <Table striped bordered hover className={darkMode ? "table-dark" : ""}>
                  <thead>
                    <tr>
                      <th>Nama Mobil</th>
                      <th>Kategori</th>
                      <th>Promo</th>
                      <th>Fitur</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unavailableCars.map(car => (
                      <tr key={car.id}>
                        <td>{car.nama}</td>
                        <td>{car.kategori}</td>
                        <td>
                          {car.promo
                            ? <Badge bg="warning" className="text-dark">{car.promo}%</Badge>
                            : <span className="text-muted">-</span>}
                        </td>
                        <td>
                          {Array.isArray(car.fitur) && car.fitur.length > 0
                            ? car.fitur.map((f, i) => (
                                <Badge key={i} bg="info" className="me-1">{f}</Badge>
                              ))
                            : <span className="text-muted">-</span>}
                        </td>
                        <td>
                          <Badge bg="danger">Tidak Tersedia</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Mobil Sedang Disewa */}
        <Card className="mb-4">
          <Card.Header>
            <FaCar className="me-2" /> Mobil Sedang Disewa Hari Ini
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              {carsOnRent.length === 0 ? (
                <Alert variant="info">Tidak ada mobil yang sedang disewa hari ini.</Alert>
              ) : (
                <Table striped bordered hover className={darkMode ? "table-dark" : ""}>
                  <thead>
                    <tr>
                      <th>Nama Mobil</th>
                      <th>Penyewa</th>
                      <th>Tanggal Sewa</th>
                      <th>Tanggal Kembali</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carsOnRent.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.carName}</td>
                        <td>{item.userName}</td>
                        <td>{moment(item.pickupDate).format("D MMM YYYY")}</td>
                        <td>{moment(item.returnDate).format("D MMM YYYY")}</td>
                        <td>
                          <Badge bg={
                            item.status === "confirmed"
                              ? "info"
                              : item.status === "pending"
                              ? "warning"
                              : "secondary"
                          }>
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Mobil yang Akan Disewa */}
        <Card className="mb-4">
          <Card.Header>
            <FaCar className="me-2" /> Daftar Mobil yang Akan Disewa
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              {carsWillBeRented.length === 0 ? (
                <Alert variant="info">Tidak ada mobil yang akan disewa.</Alert>
              ) : (
                <Table striped bordered hover className={darkMode ? "table-dark" : ""}>
                  <thead>
                    <tr>
                      <th>Nama Mobil</th>
                      <th>Penyewa</th>
                      <th>Tanggal Sewa</th>
                      <th>Tanggal Kembali</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carsWillBeRented.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.carName}</td>
                        <td>{item.userName}</td>
                        <td>{moment(item.pickupDate).format("D MMM YYYY")}</td>
                        <td>{moment(item.returnDate).format("D MMM YYYY")}</td>
                        <td>
                          <Badge bg={
                            item.status === "confirmed"
                              ? "info"
                              : item.status === "pending"
                              ? "warning"
                              : "secondary"
                          }>
                            {item.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Modal Detail Order */}
        <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="table-responsive">
              {modalOrders.length === 0 ? (
                <Alert variant="info">Tidak ada pesanan.</Alert>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Pelanggan</th>
                      <th>Mobil</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                      <th>Pembayaran</th>
                      <th>Total</th>
                      <th>Bukti Bayar</th>
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
                          <Badge bg={
                            order.status === "completed"
                              ? "success"
                              : order.status === "cancelled"
                              ? "danger"
                              : order.status === "confirmed"
                              ? "info"
                              : order.status === "pending"
                              ? "warning"
                              : "secondary"
                          }>
                            {order.status === "completed"
                              ? "Selesai"
                              : order.status === "cancelled"
                              ? "Dibatalkan"
                              : order.status === "confirmed"
                              ? "Dikonfirmasi"
                              : order.status === "pending"
                              ? "Pending"
                              : order.status}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={
                            order.payment_status === "paid"
                              ? "success"
                              : order.payment_status === "pending_verification"
                              ? "warning"
                              : order.payment_status === "rejected"
                              ? "danger"
                              : "secondary"
                          }>
                            {order.payment_status === "paid"
                              ? "Lunas"
                              : order.payment_status === "pending_verification"
                              ? "Menunggu Verifikasi"
                              : order.payment_status === "rejected"
                              ? "Ditolak"
                              : order.payment_status}
                          </Badge>
                        </td>
                        <td>
                          {formatCurrency(order.total_price)}
                        </td>
                        <td>
                          {order.payment_proof ? (
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleDownloadBukti(order)}
                              title="Download Bukti"
                            >
                              <FaDownload />
                            </Button>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Modal.Body>
        </Modal>

        {/* Modal Performa Admin */}
        <Modal show={showAdminModal} onHide={() => setShowAdminModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Rekap Performa Admin ({year})</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="table-responsive">
              {adminStatsArr.length === 0 ? (
                <Alert variant="info">Belum ada data admin atau pesanan belum ada yang diproses admin.</Alert>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Nama Admin</th>
                      <th>Email</th>
                      <th>Jumlah Pesanan</th>
                      <th>Omzet</th>
                      <th>Detail</th>
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
                            variant="outline-primary"
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
              )}
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default AdminReport;