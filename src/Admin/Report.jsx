import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Spinner, Alert, Button, Badge, Row, Col, Form, Modal } from "react-bootstrap";
import { FaFileCsv, FaChartBar, FaCarSide, FaFilePdf, FaSearch } from "react-icons/fa";
import { CSVLink } from "react-csv";
import moment from "moment";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement, LineElement } from "chart.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, PointElement, LineElement);


const API_URL = "http://localhost:3000/api";

const AdminReport = ({ darkMode }) => {
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

  // Grafik penjualan per bulan
  const chartData = {
    labels: months,
    datasets: [
      {
        label: `Pesanan ${year}`,
        data: monthlyReport.map(r => r.orderCount),
        backgroundColor: "#0d6efd",
        borderRadius: 8,
        maxBarThickness: 40,
      },
      {
        label: `User Baru ${year}`,
        data: userMonthly,
        backgroundColor: "#ffc107",
        borderRadius: 8,
        maxBarThickness: 40,
        type: "line"
      }
    ],
  };

  // Grafik omzet per bulan
  const omzetChartData = {
    labels: months,
    datasets: [
      {
        label: `Omzet ${year}`,
        data: monthlyReport.map(r => r.omzet),
        backgroundColor: "#198754",
        borderRadius: 8,
        maxBarThickness: 40,
      }
    ]
  };

  // Grafik mobil terlaris
  const carChartData = {
    labels: carSalesArr.map(c => c.car),
    datasets: [
      {
        label: "Jumlah Disewa",
        data: carSalesArr.map(c => c.count),
        backgroundColor: [
          "#0d6efd", "#198754", "#ffc107", "#dc3545", "#6610f2", "#20c997", "#fd7e14"
        ],
        borderRadius: 8,
        maxBarThickness: 40,
      },
    ],
  };

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Laporan Penjualan & Statistik Tahun ${year}`, 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);

    const tableColumn = ["Bulan", "Jumlah Pesanan", "Total Omzet"];
    const tableRows = [];

    monthlyReport.forEach(row => {
      const rowData = [
        row.month,
        row.orderCount.toString(),
        "Rp " + row.omzet.toLocaleString("id-ID")
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 10 }
    });

    doc.save(`laporan-penjualan-${year}.pdf`);
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

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <div className="container py-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
          <h3 className="mb-0"><FaChartBar className="me-2" />Laporan Penjualan & Statistik</h3>
          <div className="d-flex gap-2">
            <Form.Select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              style={{ maxWidth: 120 }}
              className={darkMode ? "bg-dark text-light" : ""}
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Form.Select>
            <Form.Select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ maxWidth: 160 }}
              className={darkMode ? "bg-dark text-light" : ""}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="paid">Paid</option>
            </Form.Select>
            <Form.Select
              value={carFilter}
              onChange={e => setCarFilter(e.target.value)}
              style={{ maxWidth: 200 }}
              className={darkMode ? "bg-dark text-light" : ""}
            >
              <option value="all">Semua Mobil</option>
              {cars.map(car => (
                <option key={car.id} value={car.id}>{car.nama}</option>
              ))}
            </Form.Select>
            <Button variant="danger" className="fw-bold" onClick={handleExportPDF}>
              <FaFilePdf className="me-2" />Export PDF
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2">Memuat laporan...</div>
          </div>
        ) : (
          <>
            {/* Ringkasan */}
            <Row className="mb-4 g-3">
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <div className="fw-bold" style={{ fontSize: 18 }}>Total Omzet</div>
                    <div className="fs-4 text-success">Rp{totalOmzet.toLocaleString("id-ID")}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <div className="fw-bold" style={{ fontSize: 18 }}>Total Pesanan</div>
                    <div className="fs-4">{totalOrders}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <div className="fw-bold" style={{ fontSize: 18 }}>Total Mobil</div>
                    <div className="fs-4">{totalCars}</div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center">
                  <Card.Body>
                    <div className="fw-bold" style={{ fontSize: 18 }}>Total Pengguna</div>
                    <div className="fs-4">{totalUsers}</div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Rekap Penjualan per Bulan */}
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Rekap Penjualan per Bulan {year}</span>
                <div className="d-flex gap-2">
                  <CSVLink
                    data={csvData}
                    headers={csvHeaders}
                    filename={`laporan-penjualan-${year}.csv`}
                    className="btn btn-outline-success btn-sm"
                    separator=";"
                    enclosingCharacter={'"'}
                  >
                    <FaFileCsv className="me-2" />
                    Export CSV
                  </CSVLink>
                  <Button variant="outline-danger" size="sm" onClick={handleExportPDF}>
                    <FaFilePdf className="me-2" />
                    Export PDF
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={7}>
                    <div className="table-responsive">
                      <Table striped bordered hover className={darkMode ? "table-dark" : ""}>
                        <thead>
                          <tr>
                            <th>Bulan</th>
                            <th>Jumlah Pesanan</th>
                            <th>Total Omzet</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyReport.map((row, idx) => (
                            <tr key={row.month}>
                              <td>
                                <Button
                                  variant="link"
                                  className="p-0"
                                  onClick={() => handleBarClick([{ index: idx }], "month")}
                                >
                                  {row.month}
                                </Button>
                              </td>
                              <td>
                                <Badge bg="primary">{row.orderCount}</Badge>
                              </td>
                              <td>
                                <span className="fw-bold text-success">
                                  Rp{row.omzet.toLocaleString("id-ID")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                  <Col md={5} className="d-flex align-items-center">
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: true } },
                        scales: { y: { beginAtZero: true, precision: 0 } },
                        onClick: (evt, elems) => handleBarClick(elems, "month")
                      }}
                    />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={12}>
                    <Bar
                      data={omzetChartData}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: true } },
                        scales: { y: { beginAtZero: true, precision: 0 } }
                      }}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Statistik User Baru */}
            <Card className="mb-4">
              <Card.Header>
                Statistik User Baru per Bulan {year}
              </Card.Header>
              <Card.Body>
                <Bar
                  data={{
                    labels: months,
                    datasets: [
                      {
                        label: "User Baru",
                        data: userMonthly,
                        backgroundColor: "#ffc107",
                        borderRadius: 8,
                        maxBarThickness: 40,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: true } },
                    scales: { y: { beginAtZero: true, precision: 0 } }
                  }}
                />
              </Card.Body>
            </Card>

            {/* Mobil Terlaris */}
            <Card className="mb-4">
              <Card.Header className="d-flex align-items-center">
                <FaCarSide className="me-2" /> Mobil Terlaris {year}
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={7}>
                    <div className="table-responsive">
                      <Table striped bordered hover className={darkMode ? "table-dark" : ""}>
                        <thead>
                          <tr>
                            <th>Nama Mobil</th>
                            <th>Jumlah Disewa</th>
                            <th>Omzet</th>
                          </tr>
                        </thead>
                        <tbody>
                          {carSalesArr.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="text-center">Belum ada data penjualan.</td>
                            </tr>
                          ) : (
                            carSalesArr.map((car, idx) => (
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
                                  <Badge bg="info">{car.count}</Badge>
                                </td>
                                <td>
                                  <span className="fw-bold text-success">
                                    Rp{car.omzet.toLocaleString("id-ID")}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                  <Col md={5} className="d-flex align-items-center">
                    <Bar
                      data={carChartData}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true, precision: 0 } },
                        onClick: (evt, elems) => handleBarClick(elems, "car")
                      }}
                    />
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