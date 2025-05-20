import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, Table, Spinner, Alert, Button, Badge, Row, Col, Form, Modal
} from "react-bootstrap";
import {
  FaFileCsv, FaChartBar, FaCarSide, FaFilePdf, FaSearch, FaSun, FaMoon
} from "react-icons/fa";
import { CSVLink } from "react-csv";
import moment from "moment";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement, LineElement
} from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement, LineElement);

const API_URL = "http://localhost:3000/api";

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

  // Rekap total
  const totalOmzet = filteredOrders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const totalOrders = filteredOrders.length;
  const totalCars = cars.length;
  const totalUsers = users.length;

  // Rekap per bulan
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
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
  const carSales = {};
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
  const carSalesArr = Object.values(carSales).sort((a, b) => b.count - a.count);

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

  // CSV Export
  const csvHeaders = [
    { label: "Bulan", key: "month" },
    { label: "Jumlah Pesanan", key: "orderCount" },
    { label: "Total Omzet", key: "omzet" }
  ];
  const csvData = monthlyReport.map(row => ({
    ...row,
    omzet: row.omzet.toLocaleString("id-ID")
  }));

  // Grafik penjualan per bulan (Line Curve)
  const chartData = {
    labels: months,
    datasets: [
      {
        type: "line",
        label: `Jumlah Pesanan`,
        data: monthlyReport.map(r => r.orderCount),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#0d6efd",
        yAxisID: "y",
      },
      {
        type: "line",
        label: `Omzet (Rp)`,
        data: monthlyReport.map(r => r.omzet),
        borderColor: "#198754",
        backgroundColor: "rgba(25,135,84,0.15)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#198754",
        yAxisID: "y1",
      },
      {
        type: "line",
        label: `User Baru`,
        data: userMonthly,
        borderColor: "#ffc107",
        backgroundColor: "rgba(255,193,7,0.15)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#ffc107",
        yAxisID: "y2",
      }
    ],
  };

  // Grafik mobil terlaris (Line Curve)
  const carChartData = {
    labels: carSalesArr.map(c => c.car),
    datasets: [
      {
        type: "line",
        label: "Jumlah Disewa",
        data: carSalesArr.map(c => c.count),
        borderColor: "#0d6efd",
        backgroundColor: "rgba(13,110,253,0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#0d6efd",
      }
    ],
  };

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

    // Statistik User Baru
    doc.text("Statistik User Baru per Bulan", 14, y);
    y += 6;
    autoTable(doc, {
      head: [["Bulan", "User Baru"]],
      body: months.map((m, i) => [m, userMonthly[i]]),
      startY: y,
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 8;

    // Grafik User Baru
    const chart2 = document.querySelector("#chart-user canvas");
    if (chart2) {
      const imgData = await html2canvas(chart2).then(c => c.toDataURL("image/png"));
      doc.text("Grafik User Baru", 14, y);
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
    const chart3 = document.querySelector("#chart-mobil canvas");
    if (chart3) {
      const imgData = await html2canvas(chart3, { backgroundColor: "#fff" }).then(c => c.toDataURL("image/png"));
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

    // Sheet 2: Statistik User Baru
    const ws2 = XLSX.utils.json_to_sheet(months.map((m, i) => ({
      Bulan: m,
      "User Baru": userMonthly[i]
    })));
    XLSX.utils.book_append_sheet(wb, ws2, "User Baru");

    // Sheet 3: Mobil Terlaris
    const ws3 = XLSX.utils.json_to_sheet(carSalesArr.map(car => ({
      "Nama Mobil": car.car,
      "Jumlah Disewa": car.count,
      "Omzet": car.omzet
    })));
    XLSX.utils.book_append_sheet(wb, ws3, "Mobil Terlaris");

    // Sheet 4: Mobil Tidak Pernah Disewa
    const ws4 = XLSX.utils.json_to_sheet(neverRentedCars.map(car => ({
      "Nama Mobil": car.nama,
      "Kategori": car.kategori,
      "Status": car.status === "available" ? "Tersedia" : "Tidak Tersedia"
    })));
    XLSX.utils.book_append_sheet(wb, ws4, "Mobil Tidak Pernah Disewa");

    XLSX.writeFile(wb, `laporan-penjualan-${year}.xlsx`);
  };

  // Tampilkan detail order saat klik bar chart
  const handleBarClick = (elems, type = "month") => {
    if (!elems.length) return;
    if (type === "month") {
      const idx = elems[0].index;
      setModalTitle(`Detail Pesanan Bulan ${months[idx]} ${year}`);
      setModalOrders(monthlyReport[idx].orders);
      setShowOrderModal(true);
    } else if (type === "car") {
      const idx = elems[0].index;
      setModalTitle(`Detail Pesanan Mobil ${carSalesArr[idx].car} (${year})`);
      setModalOrders(carSalesArr[idx].orders);
      setShowOrderModal(true);
    }
  };

  // Mobil tersedia & tidak tersedia
  const availableCars = cars.filter(car => car.status === "available");
  const unavailableCars = cars.filter(car => car.status !== "available");

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <div className="container py-4">
        {/* Header & Filter */}
        <Row className="align-items-center mb-4 g-2 flex-nowrap">
          <Col xs="auto" className="flex-grow-1">
            <h3 className="mb-0 d-flex align-items-center" style={{ whiteSpace: "nowrap" }}>
              <FaChartBar className="me-2" />
              Laporan Penjualan & Statistik
            </h3>
          </Col>
          <Col xs="auto">
            <div className="d-flex align-items-center gap-2 flex-nowrap">
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
                variant={darkMode ? "light" : "dark"}
                onClick={toggleDarkMode}
                title={darkMode ? "Light Mode" : "Dark Mode"}
                className="d-flex align-items-center"
                style={{ minWidth: 40, justifyContent: "center" }}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </Button>
            </div>
          </Col>
        </Row>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2">Memuat laporan...</div>
          </div>
        ) : (
          <>
            {/* Ringkasan */}
            <Row className="mb-4 g-3">
              <Col xs={12} md={3}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <div className="fw-bold" style={{ fontSize: 18 }}>Total Omzet</div>
                    <div className="fs-4 text-success">Rp{totalOmzet.toLocaleString("id-ID")}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={3}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <div className="fw-bold" style={{ fontSize: 18 }}>Total Pesanan</div>
                    <div className="fs-4">{totalOrders}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={3}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <div className="fw-bold" style={{ fontSize: 18 }}>Total Mobil</div>
                    <div className="fs-4">{totalCars}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={3}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <div className="fw-bold" style={{ fontSize: 18 }}>Total Pengguna</div>
                    <div className="fs-4">{totalUsers}</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Grafik Penjualan & Omzet */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                <span>Grafik Jumlah Pesanan, Omzet & User Baru {year}</span>
              </Card.Header>
              <Card.Body>
                <div style={{ minHeight: 350 }}>
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: true, position: "top" },
                        title: {
                          display: true,
                          text: "Jumlah Pesanan, Omzet & User Baru per Bulan",
                          font: { size: 18 }
                        },
                        tooltip: {
                          callbacks: {
                            label: ctx => {
                              if (ctx.dataset.label === "Omzet (Rp)") {
                                return `Omzet: Rp${ctx.parsed.y.toLocaleString("id-ID")}`;
                              }
                              if (ctx.dataset.label === "Jumlah Pesanan") {
                                return `Pesanan: ${ctx.parsed.y}`;
                              }
                              if (ctx.dataset.label === "User Baru") {
                                return `User Baru: ${ctx.parsed.y}`;
                              }
                              return ctx.parsed.y;
                            }
                          }
                        }
                      },
                      scales: {
                        x: { title: { display: true, text: "Bulan" } },
                        y: {
                          beginAtZero: true,
                          title: { display: true, text: "Pesanan" },
                          position: "left",
                          grid: { color: "#eee" }
                        },
                        y1: {
                          beginAtZero: true,
                          title: { display: true, text: "Omzet (Rp)" },
                          position: "right",
                          grid: { drawOnChartArea: false }
                        },
                        y2: {
                          beginAtZero: true,
                          display: false
                        }
                      },
                      onClick: (evt, elems) => handleBarClick(elems, "month")
                    }}
                    height={350}
                  />
                </div>
              </Card.Body>
            </Card>

            {/* Mobil Terlaris */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="d-flex align-items-center">
                <FaCarSide className="me-2" /> Grafik Mobil Terlaris {year}
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
                                        onClick={() => handleBarClick([{ index: idx }], "car")}
                                      >
                                        {car.car}
                                      </Button>
                                    </td>
                                    <td>
                                      {carDetail?.promo
                                        ? <Badge bg="warning" className="text-dark">{carDetail.promo}%</Badge>
                                        : <span className="text-muted">-</span>}
                                    </td>
                                    <td>
                                      {Array.isArray(carDetail?.fitur) && carDetail.fitur.length > 0
                                        ? carDetail.fitur.map((f, i) => (
                                            <Badge key={i} bg="info" className="me-1">{f}</Badge>
                                          ))
                                        : <span className="text-muted">-</span>}
                                    </td>
                                    <td>
                                      <Badge bg="info">{car.count}</Badge>
                                    </td>
                                    <td>
                                      <span className="fw-bold text-success">
                                        Rp{car.omzet.toLocaleString("id-ID")}
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
                  <Col xs={12} md={5} className="d-flex align-items-center">
                    <div id="chart-mobil" style={{ width: "100%", minHeight: 320 }}>
                      <Line
                        data={carChartData}
                        height={320}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: true, position: "top" },
                            title: {
                              display: true,
                              text: "Jumlah Disewa Mobil Terlaris (Curve)",
                              font: { size: 16 }
                            },
                            tooltip: {
                              callbacks: {
                                label: ctx => `Disewa: ${ctx.parsed.y}x`
                              }
                            }
                          },
                          scales: {
                            x: {
                              title: { display: true, text: "Mobil" },
                              ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 }
                            },
                            y: {
                              beginAtZero: true,
                              title: { display: true, text: "Jumlah Disewa" },
                              precision: 0
                            }
                          },
                          onClick: (evt, elems) => handleBarClick(elems, "car")
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
                <FaSearch className="me-2" /> Mobil Tidak Pernah Disewa {year}
              </Card.Header>
              <Card.Body>
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
              </Card.Body>
            </Card>

            {/* Mobil Tersedia */}
            <Card className="mb-4">
              <Card.Header>
                <FaCarSide className="me-2" /> Daftar Mobil Tersedia
              </Card.Header>
              <Card.Body>
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
              </Card.Body>
            </Card>

            {/* Mobil Tidak Tersedia */}
            <Card className="mb-4">
              <Card.Header>
                <FaCarSide className="me-2" /> Daftar Mobil Tidak Tersedia
              </Card.Header>
              <Card.Body>
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
              </Card.Body>
            </Card>

            {/* Modal Detail Order */}
            <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg" centered>
              <Modal.Header closeButton>
                <Modal.Title>{modalTitle}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
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
                            Rp{Number(order.total_price).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Modal.Body>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminReport;