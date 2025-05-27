import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, Spinner, Alert, Badge, Dropdown, Button, Modal, Form,
  OverlayTrigger, Tooltip, Toast, ToastContainer, InputGroup, Row, Col, Card
} from "react-bootstrap";
import moment from "moment";
import {
  FaEllipsisV, FaEye, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaFileCsv, FaFilePdf, FaCheckSquare, FaRegSquare, FaPrint, FaBell
} from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:3000/api";
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatDate = (date) => date ? moment(date).format('DD/MM/YYYY') : '';
const formatCurrency = (amount) => amount ? Number(amount).toLocaleString('id-ID') : '';
const formatStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return 'Menunggu';
    case 'confirmed': return 'Dikonfirmasi';
    case 'completed': return 'Selesai';
    case 'cancelled': return 'Dibatalkan';
    case 'rejected': return 'Ditolak';
    default: return status || '';
  }
};
const formatPaymentStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending_verification': return 'Menunggu Verifikasi';
    case 'paid': return 'Lunas';
    case 'rejected': return 'Ditolak';
    case 'unpaid': return 'Belum Bayar';
    default: return status || '';
  }
};

const getStatusBadge = (status) => {
  switch ((status || "").toLowerCase()) {
    case "pending": return "warning";
    case "confirmed": return "info";
    case "completed": return "primary";
    case "cancelled": return "danger";
    case "rejected": return "danger";
    default: return "secondary";
  }
};

const OrdersPage = ({ darkMode }) => {
  const [orders, setOrders] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusToEdit, setStatusToEdit] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIds, setDeleteIds] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCar, setFilterCar] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [paymentStatusToEdit, setPaymentStatusToEdit] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
    fetchCars();
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [toast]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setOrders([]);
      showToast("Gagal memuat data pesanan!", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await axios.get(`${API_URL}/layanan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCars(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      setCars([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data || []);
    } catch {}
  };

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ ...toast, show: false }), 2500);
  };

  // Filter & Search & Date
  const filteredOrders = orders
    .filter((order) => {
      const searchLower = search.toLowerCase();
      const matchSearch =
        (order.user?.name?.toLowerCase() || "").includes(searchLower) ||
        (order.layanan?.nama?.toLowerCase() || "").includes(searchLower) ||
        order.id.toString().includes(searchLower);
      const matchStatus =
        filterStatus === "all" || (order.status || "").toLowerCase() === filterStatus;
      const matchCar =
        filterCar === "all" || (order.layanan?.id?.toString() === filterCar);
      const matchPayment =
        filterPayment === "all" || (order.payment_method || "") === filterPayment;
      let matchDate = true;
      if (dateFrom) {
        matchDate =
          matchDate &&
          moment(order.createdAt || order.created_at).isSameOrAfter(moment(dateFrom), "day");
      }
      if (dateTo) {
        matchDate =
          matchDate &&
          moment(order.createdAt || order.created_at).isSameOrBefore(moment(dateTo), "day");
      }
      return matchSearch && matchStatus && matchCar && matchPayment && matchDate;
    });

  // Sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const { key, direction } = sortConfig;
    let valA, valB;
    if (key === "user") {
      valA = a.user?.name || "";
      valB = b.user?.name || "";
    } else if (key === "layanan") {
      valA = a.layanan?.nama || "";
      valB = b.layanan?.nama || "";
    } else if (key === "total_price") {
      valA = Number(a.total_price) || 0;
      valB = Number(b.total_price) || 0;
    } else if (key === "createdAt") {
      valA = new Date(a.createdAt || a.created_at);
      valB = new Date(b.createdAt || b.created_at);
    } else {
      valA = a[key];
      valB = b[key];
    }
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedOrders.length / pageSize);
  const pagedOrders = sortedOrders.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ms-1 text-muted" />;
    return sortConfig.direction === "asc" ? (
      <FaSortUp className="ms-1" />
    ) : (
      <FaSortDown className="ms-1" />
    );
  };

  // CSV Export
  const csvHeaders = [
    { label: "No. Pesanan", key: "id" },
    { label: "Nama Pelanggan", key: "user_name" },
    { label: "Kendaraan", key: "car_name" },
    { label: "Tanggal Mulai Sewa", key: "pickup_date" },
    { label: "Tanggal Selesai Sewa", key: "return_date" },
    { label: "Durasi (Hari)", key: "duration" },
    { label: "Total Pembayaran", key: "total_price" },
    { label: "Status Pesanan", key: "status" },
    { label: "Status Pembayaran", key: "payment_status" },
    { label: "Metode Pembayaran", key: "payment_method" },
    { label: "Tanggal Dibuat", key: "created_at" },
    { label: "Catatan", key: "notes" }
  ];

  const formatCSVData = (orders) => {
    return orders.map((order) => ({
      id: order.id || '',
      user_name: order.user?.name || '',
      car_name: order.layanan?.nama || '',
      pickup_date: formatDate(order.pickup_date),
      return_date: formatDate(order.return_date),
      duration: order.pickup_date && order.return_date
        ? moment(order.return_date).diff(moment(order.pickup_date), "days")
        : '',
      total_price: formatCurrency(order.total_price),
      status: formatStatus(order.status),
      payment_status: formatPaymentStatus(order.payment_status),
      payment_method: order.payment_method || '',
      created_at: order.createdAt 
        ? moment(order.createdAt).format("DD/MM/YYYY HH:mm")
        : '',
      notes: order.additional_notes || ''
    }));
  };

  // Excel Export
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(formatCSVData(sortedOrders));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pesanan");
    XLSX.writeFile(wb, `daftar-pesanan-${moment().format("DDMMYYYY")}.xlsx`);
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(14);
    doc.text("Daftar Pesanan", 14, 14);
    autoTable(doc, {
      head: [csvHeaders.map(h => h.label)],
      body: formatCSVData(sortedOrders).map(row => csvHeaders.map(h => row[h.key])),
      startY: 20,
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 }
    });
    doc.save(`daftar-pesanan-${moment().format("DDMMYYYY")}.pdf`);
  };

  // Bulk Action
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(pagedOrders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };
  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    if (bulkAction === "delete") {
      setDeleteIds(selectedIds);
      setShowBulkModal(true);
    } else if (bulkAction === "completed" || bulkAction === "cancelled") {
      try {
        await Promise.all(selectedIds.map(id =>
          axios.put(`${API_URL}/orders/${id}`, { status: bulkAction }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ));
        showToast("Status pesanan berhasil diubah!");
        setSelectedIds([]);
        fetchOrders();
      } catch {
        showToast("Gagal update status pesanan!", "danger");
      }
    }
  };
  const handleBulkDelete = async () => {
    try {
      await Promise.all(deleteIds.map(id =>
        axios.put(`${API_URL}/orders/${id}`, { status: "cancelled" }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));
      setOrders((orders) =>
        orders.map((o) =>
          deleteIds.includes(o.id) ? { ...o, status: "cancelled" } : o
        )
      );
      setShowBulkModal(false);
      setSelectedIds([]);
      showToast("Pesanan berhasil dibatalkan!");
    } catch {
      showToast("Gagal membatalkan pesanan!", "danger");
    }
  };

  // Modal helpers
  const handleShowDetail = async (order) => {
    setDetailLoading(true);
    setShowDetail(true);
    try {
      const res = await axios.get(`${API_URL}/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrder(res.data.data || order);
    } catch (err) {
      setSelectedOrder(order);
      showToast("Gagal memuat detail pesanan!", "danger");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleShowStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusToEdit("");
    setShowStatusModal(true);
  };

  const handleShowDeleteModal = (id) => {
    setDeleteIds([id]);
    setShowDeleteModal(true);
  };

  const handleShowPaymentStatusModal = (order) => {
    setSelectedOrder(order);
    setPaymentStatusToEdit("");
    setShowPaymentStatusModal(true);
  };

  // Status update
  const handleStatusUpdate = async () => {
    if (!statusToEdit) return;
    try {
      await axios.put(
        `${API_URL}/orders/${selectedOrder.id}`,
        { status: statusToEdit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Status pesanan berhasil diupdate!");
      setShowStatusModal(false);
      // Update orders state langsung tanpa fetch ulang
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: statusToEdit } : o
        )
      );
    } catch (err) {
      showToast("Gagal update status!", "danger");
    }
  };

  // Payment Status update
  const handlePaymentStatusUpdate = async () => {
    if (!paymentStatusToEdit) return;
    try {
      await axios.put(
        `${API_URL}/orders/${selectedOrder.id}/verify`,
        { status: paymentStatusToEdit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Status pembayaran berhasil diupdate!");
      setShowPaymentStatusModal(false);
      // Update orders state langsung tanpa fetch ulang
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, payment_status: paymentStatusToEdit } : o
        )
      );
    } catch (err) {
      showToast("Gagal update status pembayaran!", "danger");
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/orders/${deleteIds[0]}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders((orders) => orders.filter((o) => o.id !== deleteIds[0]));
      setShowDeleteModal(false);
      setSelectedIds(selectedIds.filter(id => id !== deleteIds[0]));
      showToast("Pesanan berhasil dihapus!");
    } catch (err) {
      showToast("Gagal menghapus pesanan!", "danger");
    }
  };

  // Status options sesuai backend
  const renderStatusOptions = () => {
    const options = [
      { value: "pending", label: "Pending" },
      { value: "confirmed", label: "Confirmed" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" }
    ];
    return options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ));
  };

  // Print Invoice
  const handlePrintInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`INVOICE PESANAN #${order.id}`, 14, 18);
    doc.setFontSize(12);
    doc.text(`Nama Pelanggan: ${order.user?.name || "-"}`, 14, 30);
    doc.text(`Mobil: ${order.layanan?.nama || "-"}`, 14, 38);
    doc.text(`Tanggal Sewa: ${formatDate(order.pickup_date)} - ${formatDate(order.return_date)}`, 14, 46);
    doc.text(`Durasi: ${order.pickup_date && order.return_date ? moment(order.return_date).diff(moment(order.pickup_date), "days") + " hari" : "-"}`, 14, 54);
    doc.text(`Total: Rp${Number(order.total_price || 0).toLocaleString('id-ID')}`, 14, 62);
    doc.text(`Status: ${formatStatus(order.status)}`, 14, 70);
    doc.text(`Status Pembayaran: ${formatPaymentStatus(order.payment_status)}`, 14, 78);
    doc.save(`invoice-pesanan-${order.id}.pdf`);
  };

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <div className="container-fluid py-4">
        {/* Header & Export */}
        <Row className="align-items-center mb-4 g-2">
          <Col xs={12} md={6}>
            <h3 className="mb-0 fw-bold">
              <span className="me-2 text-primary">
                <FaFileCsv />
              </span>
              Daftar Pesanan
            </h3>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0 d-flex gap-2 justify-content-md-end">
            {/* Export Buttons */}
            <CSVLink
              data={formatCSVData(sortedOrders)}
              headers={csvHeaders}
              filename={`daftar-pesanan-${moment().format("DDMMYYYY")}.csv`}
              className="btn btn-outline-success"
              separator=";"
              enclosingCharacter={'"'}
            >
              <FaFileCsv className="me-2" />
              Export CSV
            </CSVLink>
            
            <Button variant="outline-danger" onClick={handleExportPDF}>
              <FaFilePdf className="me-2" />
              Export PDF
            </Button>
          </Col>
        </Row>

        {/* Filter */}
        <Card className={`mb-4 shadow-sm border-0 ${darkMode ? "bg-secondary" : "bg-white"}`}>
          <Card.Body>
            <Row className="g-2 align-items-stretch">
              <Col xs={12} sm={6} md={3}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Cari pelanggan, mobil, atau ID..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </InputGroup>
              </Col>
              <Col xs={6} sm={3} md={2}>
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Col>
              <Col xs={6} sm={3} md={2}>
                <Form.Select
                  value={filterCar}
                  onChange={(e) => {
                    setFilterCar(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Semua Mobil</option>
                  {cars.map(car => (
                    <option key={car.id} value={car.id}>{car.nama}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} sm={3} md={2}>
                <Form.Select
                  value={filterPayment}
                  onChange={(e) => {
                    setFilterPayment(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Semua Pembayaran</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="e_wallet">E-Wallet</option>
                </Form.Select>
              </Col>
              <Col xs={6} sm={3} md={1}>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Dari tanggal"
                />
              </Col>
              <Col xs={6} sm={3} md={1}>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Sampai tanggal"
                />
              </Col>
              <Col xs={6} sm={3} md={1}>
                <Form.Select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt} / halaman</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={12} md={2} className="text-md-end mt-2 mt-md-0">
                <Form.Select
                  value={bulkAction}
                  onChange={e => setBulkAction(e.target.value)}
                  disabled={selectedIds.length === 0}
                >
                  <option value="">Bulk Action</option>
                  <option value="completed">Set Selesai</option>
                  <option value="cancelled">Set Dibatalkan</option>
                  <option value="delete">Hapus</option>
                </Form.Select>
                <Button
                  variant="primary"
                  className="ms-2"
                  disabled={!bulkAction || selectedIds.length === 0}
                  onClick={handleBulkAction}
                >
                  Terapkan
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Table */}
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-0">
            <div className="table-responsive" style={{ maxHeight: 600 }}>
              <Table
                striped
                bordered
                hover
                className={`align-middle mb-0 ${darkMode ? "table-dark" : ""}`}
                style={{ minWidth: 1100 }}
              >
                <thead className={darkMode ? "table-secondary" : "table-light"} style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleSelectAll(selectedIds.length !== pagedOrders.length)}
                        title={selectedIds.length === pagedOrders.length ? "Unselect All" : "Select All"}
                      >
                        {selectedIds.length === pagedOrders.length ? <FaCheckSquare /> : <FaRegSquare />}
                      </Button>
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("id")}>
                      ID {getSortIcon("id")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("user")}>
                      Pelanggan {getSortIcon("user")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("layanan")}>
                      Mobil {getSortIcon("layanan")}
                    </th>
                    <th>Tanggal Sewa</th>
                    <th>Durasi (hari)</th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("total_price")}>
                      Total {getSortIcon("total_price")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("status")}>
                      Status {getSortIcon("status")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("payment_status")}>
                      Pembayaran {getSortIcon("payment_status")}
                    </th>
                    <th style={{ cursor: "pointer" }} onClick={() => handleSort("createdAt")}>
                      Dibuat {getSortIcon("createdAt")}
                    </th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={() => handleSelectOne(order.id)}
                        />
                      </td>
                      <td>
                        <Badge bg="secondary" className="fw-bold rounded-pill px-3 py-2 fs-6">
                          #{order.id}
                        </Badge>
                      </td>
                      <td>
                        <span className="fw-semibold">{order.user?.name || "-"}</span>
                      </td>
                      <td>{order.layanan?.nama || "-"}</td>
                      <td>
                        {order.pickup_date
                          ? moment(order.pickup_date).format("D MMM YYYY")
                          : "-"}
                        {" - "}
                        {order.return_date
                          ? moment(order.return_date).format("D MMM YYYY")
                          : "-"}
                      </td>
                      <td>
                        {order.pickup_date && order.return_date
                          ? moment(order.return_date).diff(
                              moment(order.pickup_date),
                              "days"
                            )
                          : "-"}
                      </td>
                      <td>
                        <span className="fw-bold text-success">
                          Rp{Number(order.total_price || 0).toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td>
                        <Badge pill bg={getStatusBadge(order.status)} className="px-3 py-2">
                          {formatStatus(order.status) || "-"}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          pill
                          bg={
                            order.payment_status === "paid"
                              ? "success"
                              : order.payment_status === "pending_verification"
                              ? "warning"
                              : order.payment_status === "rejected"
                              ? "danger"
                              : "secondary"
                          }
                          className="px-3 py-2"
                        >
                          {formatPaymentStatus(order.payment_status)}
                        </Badge>
                      </td>
                      <td>
                        {moment(order.createdAt || order.created_at).format("D MMM YYYY HH:mm")}
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant={darkMode ? "secondary" : "light"}
                            size="sm"
                            id="dropdown-actions"
                            style={{ border: "none" }}
                          >
                            <FaEllipsisV />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <OverlayTrigger
                              placement="left"
                              overlay={<Tooltip>Lihat Detail</Tooltip>}
                            >
                              <Dropdown.Item onClick={() => handleShowDetail(order)}>
                                <FaEye className="me-2" /> Detail
                              </Dropdown.Item>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="left"
                              overlay={<Tooltip>Edit Status</Tooltip>}
                            >
                              <Dropdown.Item onClick={() => handleShowStatusModal(order)}>
                                <FaEdit className="me-2" /> Edit Status
                              </Dropdown.Item>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="left"
                              overlay={<Tooltip>Edit Status Pembayaran</Tooltip>}
                            >
                              <Dropdown.Item onClick={() => handleShowPaymentStatusModal(order)}>
                                <FaEdit className="me-2" /> Edit Status Pembayaran
                              </Dropdown.Item>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="left"
                              overlay={<Tooltip>Batalkan Pesanan</Tooltip>}
                            >
                              <Dropdown.Item
                                className="text-danger"
                                onClick={() => handleShowDeleteModal(order.id)}
                              >
                                <FaTrash className="me-2" /> Batalkan
                              </Dropdown.Item>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="left"
                              overlay={<Tooltip>Cetak Invoice</Tooltip>}
                            >
                              <Dropdown.Item onClick={() => handlePrintInvoice(order)}>
                                <FaPrint className="me-2" /> Cetak Invoice
                              </Dropdown.Item>
                            </OverlayTrigger>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* Pagination & Info */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
          <div>
            Menampilkan {pagedOrders.length} dari {sortedOrders.length} pesanan
          </div>
          <div>
            <Button
              variant="outline-primary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="me-2"
            >
              &lt;
            </Button>
            Halaman {page} / {totalPages}
            <Button
              variant="outline-primary"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="ms-2"
            >
              &gt;
            </Button>
          </div>
        </div>

        {/* Toast Notification */}
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
          <Toast
            show={toast.show}
            onClose={() => setToast({ ...toast, show: false })}
            bg={toast.variant}
            delay={2500}
            autohide
          >
            <Toast.Body className="text-white">{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>

        {/* Detail Modal */}
        <Modal show={showDetail} onHide={() => setShowDetail(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Detail Pesanan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {detailLoading ? (
              <div className="text-center py-4">
                <Spinner />
              </div>
            ) : selectedOrder ? (
              <div>
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>ID:</strong>{" "}
                      <Badge bg="secondary">#{selectedOrder.id}</Badge>
                    </p>
                    <p>
                      <strong>Pelanggan:</strong> {selectedOrder.user?.name}
                    </p>
                    <p>
                      <strong>Mobil:</strong> {selectedOrder.layanan?.nama}
                    </p>
                    <p>
                      <strong>Tanggal Sewa:</strong>{" "}
                      {formatDate(selectedOrder.pickup_date)} -{" "}
                      {formatDate(selectedOrder.return_date)}
                    </p>
                    <p>
                      <strong>Durasi:</strong>{" "}
                      {selectedOrder.pickup_date && selectedOrder.return_date
                        ? moment(selectedOrder.return_date).diff(
                            moment(selectedOrder.pickup_date),
                            "days"
                          ) + " hari"
                        : "-"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Total:</strong>{" "}
                      <span className="fw-bold text-success">
                        Rp{Number(selectedOrder.total_price || 0).toLocaleString('id-ID')}
                      </span>
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <Badge bg={getStatusBadge(selectedOrder.status)}>
                        {formatStatus(selectedOrder.status)}
                      </Badge>
                    </p>
                    <p>
                      <strong>Status Pembayaran:</strong>{" "}
                      <Badge
                        bg={
                          selectedOrder.payment_status === "paid"
                            ? "success"
                            : selectedOrder.payment_status === "pending_verification"
                            ? "warning"
                            : selectedOrder.payment_status === "rejected"
                            ? "danger"
                            : "secondary"
                        }
                      >
                        {formatPaymentStatus(selectedOrder.payment_status)}
                      </Badge>
                    </p>
                    <p>
                      <strong>Metode Pembayaran:</strong>{" "}
                      {selectedOrder.payment_method}
                    </p>
                    <p>
                      <strong>Catatan:</strong> {selectedOrder.additional_notes || "-"}
                    </p>
                    {selectedOrder.payment_proof && (
                      <div className="mb-2">
                        <strong>Bukti Pembayaran:</strong>
                        <br />
                        <a
                          href={`http://localhost:3000${selectedOrder.payment_proof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={`http://localhost:3000${selectedOrder.payment_proof}`}
                            alt="Bukti Pembayaran"
                            style={{
                              maxWidth: 200,
                              maxHeight: 200,
                              border: "1px solid #ccc",
                              borderRadius: 8,
                              marginTop: 8,
                            }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/no-image.png";
                            }}
                          />
                        </a>
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            ) : (
              <Spinner />
            )}
          </Modal.Body>
        </Modal>

        {/* Edit Status Modal */}
        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Status Pesanan</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusToEdit}
                  onChange={(e) => setStatusToEdit(e.target.value)}
                >
                  <option value="">-- Pilih Status --</option>
                  {renderStatusOptions()}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              disabled={!statusToEdit}
            >
              Simpan
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Payment Status Modal */}
        <Modal show={showPaymentStatusModal} onHide={() => setShowPaymentStatusModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Status Pembayaran</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Status Pembayaran</Form.Label>
                <Form.Select
                  value={paymentStatusToEdit}
                  onChange={(e) => setPaymentStatusToEdit(e.target.value)}
                >
                  <option value="">-- Pilih Status Pembayaran --</option>
                  <option value="paid">Lunas</option>
                  <option value="rejected">Ditolak</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPaymentStatusModal(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handlePaymentStatusUpdate}
              disabled={!paymentStatusToEdit}
            >
              Simpan
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Konfirmasi Hapus</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Apakah Anda yakin ingin menghapus pesanan ini?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Hapus
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Bulk Delete Modal */}
        <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Konfirmasi Hapus</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Apakah Anda yakin ingin menghapus {deleteIds.length} pesanan terpilih?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleBulkDelete}>
              Hapus
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default OrdersPage;