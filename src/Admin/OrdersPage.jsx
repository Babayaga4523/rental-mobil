import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, Spinner, Alert, Badge, Dropdown, Button, Modal, Form,
  OverlayTrigger, Tooltip, Toast, ToastContainer, InputGroup
} from "react-bootstrap";
import moment from "moment";
import {
  FaEllipsisV, FaEye, FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown, FaFileCsv, FaMoon, FaSun
} from "react-icons/fa";
import { CSVLink } from "react-csv";

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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusToEdit, setStatusToEdit] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [darkMode, setDarkMode] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [paymentStatusToEdit, setPaymentStatusToEdit] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(
        Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      setOrders([]);
      showToast("Gagal memuat data pesanan!", "danger");
    } finally {
      setLoading(false);
    }
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
        order.user?.name?.toLowerCase().includes(searchLower) ||
        order.layanan?.nama?.toLowerCase().includes(searchLower) ||
        order.id.toString().includes(searchLower);
      const matchStatus =
        filterStatus === "all" || (order.status || "").toLowerCase() === filterStatus;
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
      return matchSearch && matchStatus && matchDate;
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

  // Modal helpers
  const handleShowDetail = async (order) => {
    setDetailLoading(true);
    setShowDetail(true);
    try {
      const res = await axios.get(`${API_URL}/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Pastikan response backend: { success, data: { ...orderDetail } }
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
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleShowPaymentStatusModal = (order) => {
    setSelectedOrder(order);
    setPaymentStatusToEdit("");
    setShowPaymentStatusModal(true);
  };

  // Status update
  const handleStatusUpdate = async () => {
    try {
      await axios.put(
        `${API_URL}/orders/${selectedOrder.id}`,
        { status: statusToEdit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Status pesanan berhasil diupdate!");
      setShowStatusModal(false);
      fetchOrders();
    } catch (err) {
      showToast("Gagal update status!", "danger");
    }
  };

  // Payment Status update
  const handlePaymentStatusUpdate = async () => {
    try {
      await axios.put(
        `${API_URL}/orders/${selectedOrder.id}/verify`,
        { status: paymentStatusToEdit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast("Status pembayaran berhasil diupdate!");
      setShowPaymentStatusModal(false);
      fetchOrders();
    } catch (err) {
      showToast("Gagal update status pembayaran!", "danger");
    }
  };

  // Delete
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/orders/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((orders) => orders.filter((o) => o.id !== deleteId));
      setShowDeleteModal(false);
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

  // Dark mode toggle
  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Daftar Pesanan</h3>
          <Button
            variant={darkMode ? "light" : "dark"}
            onClick={toggleDarkMode}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </Button>
        </div>
        <div className={`d-flex flex-wrap gap-2 mb-3 align-items-center shadow-sm p-3 rounded ${darkMode ? "bg-secondary" : "bg-white"}`}>
          <InputGroup style={{ maxWidth: 260 }}>
            <Form.Control
              type="text"
              placeholder="Cari nama pelanggan, mobil, atau ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
          <Form.Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 180 }}
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </Form.Select>
          <Form.Control
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 160 }}
            placeholder="Dari tanggal"
          />
          <span>-</span>
          <Form.Control
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 160 }}
            placeholder="Sampai tanggal"
          />
          <Form.Select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            style={{ maxWidth: 120 }}
          >
            {PAGE_SIZE_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt} / halaman</option>
            ))}
          </Form.Select>
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
        </div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2">Memuat data pesanan...</div>
          </div>
        ) : pagedOrders.length === 0 ? (
          <Alert variant="info">Tidak ada pesanan.</Alert>
        ) : (
          <>
            <div className="table-responsive shadow-sm rounded" style={{ maxHeight: 600 }}>
              <Table
                striped
                bordered
                hover
                className={`align-middle mb-0 ${darkMode ? "table-dark" : ""}`}
                style={{ minWidth: 1100 }}
              >
                <thead className={darkMode ? "table-secondary" : "table-light"} style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
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
                    <tr
                      key={order.id}
                      style={
                        order.payment_status === "pending_verification"
                          ? { background: darkMode ? "#665c00" : "#fffbe6" }
                          : {}
                      }
                    >
                      <td>
                        <Badge bg="secondary" className="fw-bold">
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
                          Rp{(order.total_price || 0).toLocaleString("id-ID")}
                        </span>
                      </td>
                      <td>
                        <Badge pill bg={getStatusBadge(order.status)}>
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
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
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
          </>
        )}

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
        <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
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
                <p>
                  <strong>Total:</strong>{" "}
                  <span className="fw-bold text-success">
                    Rp{formatCurrency(selectedOrder.total_price)}
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
      </div>
    </div>
  );
};

export default OrdersPage;