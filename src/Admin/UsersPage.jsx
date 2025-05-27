import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, Spinner, Alert, Badge, Dropdown, Button, Modal, InputGroup, Form, Toast, ToastContainer, Row, Col, Card
} from "react-bootstrap";
import { FaEllipsisV, FaEdit, FaTrash, FaFileCsv, FaFileExcel, FaUser, FaMoon, FaSun, FaSort, FaSortUp, FaSortDown, FaHistory, FaKey, FaBell, FaPlus } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import moment from "moment";

const API_URL = "http://localhost:3000/api";
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const UsersPage = ({ darkMode, toggleDarkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUser, setResetUser] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(
        Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data.users)
          ? res.data.users
          : Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      setUsers([]);
      showToast("Gagal memuat data pengguna!", "danger");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ ...toast, show: false }), 2500);
  };

  // Filter & Search
  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.id.toString().includes(searchLower);
    const matchRole =
      filterRole === "all" || user.role === filterRole;
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.status === "active") ||
      (filterStatus === "inactive" && user.status !== "active");
    return matchSearch && matchRole && matchStatus;
  });

  // Sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const { key, direction } = sortConfig;
    let valA = a[key], valB = b[key];
    if (key === "id") {
      valA = Number(a.id);
      valB = Number(b.id);
    }
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / pageSize);
  const pagedUsers = sortedUsers.slice((page - 1) * pageSize, page * pageSize);

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
    { label: "ID", key: "id" },
    { label: "Nama", key: "name" },
    { label: "Email", key: "email" },
    { label: "No. Telp", key: "no_telp" },
    { label: "Role", key: "role" },
    { label: "Status", key: "status" }
  ];
  const formatCSVData = (users) =>
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      no_telp: user.no_telp,
      role: user.role,
      status: user.status === "active" ? "Aktif" : "Nonaktif"
    }));

  // Excel Export
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(formatCSVData(sortedUsers));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pengguna");
    XLSX.writeFile(wb, `daftar-user-${Date.now()}.xlsx`);
  };

  // Modal helpers
  const handleShowDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/users/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users => users.filter(u => u.id !== deleteId));
      setShowDeleteModal(false);
      showToast("User berhasil dihapus!");
    } catch (err) {
      showToast("Gagal menghapus user!", "danger");
    }
  };

  const handleShowEditModal = (user) => {
    setEditUser(user);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      nama: form.nama.value,
      email: form.email.value,
      no_telp: form.no_telp.value,
      role: form.role.value,
      status: form.status.value,
    };
    try {
      await axios.put(`${API_URL}/users/${editUser.id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("User berhasil diupdate!");
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      showToast("Gagal update user!", "danger");
    }
  };

  // Tambah user
  const handleShowAddModal = () => {
    setShowAddModal(true);
  };
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      nama: form.nama.value,
      email: form.email.value,
      no_telp: form.no_telp.value,
      password: form.password.value,
      role: form.role.value,
      status: form.status.value,
    };
    try {
      await axios.post(`${API_URL}/users/register`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("User berhasil ditambahkan!");
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      showToast("Gagal menambah user!", "danger");
    }
  };

  // Reset password
  const handleShowResetModal = (user) => {
    setResetUser(user);
    setShowResetModal(true);
  };
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    const form = e.target;
    const data = {
      oldPassword: form.oldPassword?.value || "adminreset", // adminreset sebagai bypass
      newPassword: form.newPassword.value,
    };
    try {
      await axios.put(`${API_URL}/users/${resetUser.id}/password`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Password berhasil direset!");
      setShowResetModal(false);
    } catch (err) {
      showToast("Gagal reset password!", "danger");
    } finally {
      setResetLoading(false);
    }
  };

  // Riwayat pesanan user
  const handleShowHistoryModal = async (user) => {
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/orders/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setHistoryOrders([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Notifikasi blast
  const handleNotifBlast = () => setShowNotifModal(true);

  const handleSendNotifBlast = async (e) => {
    e.preventDefault();
    if (!notifMessage.trim()) {
      showToast("Pesan tidak boleh kosong!", "danger");
      return;
    }
    setNotifLoading(true);
    try {
      await axios.post(`${API_URL}/notifications/blast`, { message: notifMessage }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Notifikasi berhasil dikirim ke semua user!");
      setShowNotifModal(false);
      setNotifMessage("");
    } catch {
      showToast("Gagal mengirim notifikasi!", "danger");
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <div className="container-fluid py-4">
        {/* Header & Dark Mode Toggle */}
        <Row className="align-items-center mb-4 g-2">
          <Col xs={12} md={6}>
            <h3 className="mb-0 fw-bold d-flex align-items-center">
              <FaUser className="me-2" />Daftar Pengguna
            </h3>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0 d-flex gap-2 justify-content-md-end">
            <Button
              variant={darkMode ? "light" : "dark"}
              onClick={toggleDarkMode}
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </Button>
            <Button variant="info" onClick={handleNotifBlast} disabled={notifLoading}>
              <FaBell className="me-2" />
              Blast Notif
            </Button>
            <Button variant="success" onClick={handleShowAddModal}>
              <FaPlus className="me-2" />Tambah User
            </Button>
          </Col>
        </Row>
        {/* Filter & Export */}
        <Card className={`mb-4 shadow-sm ${darkMode ? "bg-secondary" : "bg-white"}`}>
          <Card.Body>
            <Row className="g-2 align-items-stretch">
              <Col xs={12} sm={6} md={3}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Cari nama/email/ID..."
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </InputGroup>
              </Col>
              <Col xs={6} sm={3} md={2}>
                <Form.Select
                  value={filterRole}
                  onChange={e => {
                    setFilterRole(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Semua Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Form.Select>
              </Col>
              <Col xs={6} sm={3} md={2}>
                <Form.Select
                  value={filterStatus}
                  onChange={e => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </Form.Select>
              </Col>
              <Col xs={6} sm={3} md={2}>
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
              <Col xs={12} md={3} className="text-md-end mt-2 mt-md-0 d-flex gap-2">
                <CSVLink
                  data={formatCSVData(sortedUsers)}
                  headers={csvHeaders}
                  filename={`daftar-user-${Date.now()}.csv`}
                  className="btn btn-outline-success w-100"
                  separator=";"
                  enclosingCharacter={'"'}
                >
                  <FaFileCsv className="me-2" />
                  Export CSV
                </CSVLink>
                
              </Col>
            </Row>
          </Card.Body>
        </Card>
        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="mt-2">Memuat data pengguna...</div>
          </div>
        ) : pagedUsers.length === 0 ? (
          <Alert variant="info">Tidak ada data pengguna.</Alert>
        ) : (
          <div className="table-responsive shadow-sm rounded">
            <Table striped bordered hover className={`align-middle mb-0 ${darkMode ? "table-dark" : ""}`}>
              <thead className={darkMode ? "table-secondary" : "table-light"} style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("id")}>
                    ID {getSortIcon("id")}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>
                    Nama {getSortIcon("name")}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("email")}>
                    Email {getSortIcon("email")}
                  </th>
                  <th>No. Telp</th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("role")}>
                    Role {getSortIcon("role")}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("status")}>
                    Status {getSortIcon("status")}
                  </th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map(user => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.no_telp || "-"}</td>
                    <td>
                      <Badge pill bg={user.role === 'admin' ? 'primary' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge pill bg={user.status === 'active' ? 'success' : 'danger'}>
                        {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant={darkMode ? "secondary" : "light"} size="sm" id="dropdown-actions">
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleShowEditModal(user)}>
                            <FaEdit className="me-2" /> Edit
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleShowHistoryModal(user)}>
                            <FaHistory className="me-2" /> Riwayat Pesanan
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleShowResetModal(user)}>
                            <FaKey className="me-2" /> Reset Password
                          </Dropdown.Item>
                          <Dropdown.Item className="text-danger" onClick={() => handleShowDeleteModal(user.id)}>
                            <FaTrash className="me-2" /> Hapus
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
          <div>
            Menampilkan {pagedUsers.length} dari {sortedUsers.length} pengguna
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

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Konfirmasi Hapus</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Apakah Anda yakin ingin menghapus user ini?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete}>Hapus</Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEditSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nama</Form.Label>
                <Form.Control name="nama" defaultValue={editUser?.name || ""} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control name="email" type="email" defaultValue={editUser?.email || ""} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>No. Telp</Form.Label>
                <Form.Control name="no_telp" defaultValue={editUser?.no_telp || ""} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select name="role" defaultValue={editUser?.role || "user"}>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" defaultValue={editUser?.status || "active"}>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Add Modal */}
        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Tambah User</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Nama</Form.Label>
                <Form.Control name="nama" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control name="email" type="email" required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>No. Telp</Form.Label>
                <Form.Control name="no_telp" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control name="password" type="password" required minLength={6} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select name="role" defaultValue="user">
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" defaultValue="active">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </Form.Select>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Reset Password Modal */}
        <Modal show={showResetModal} onHide={() => setShowResetModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Reset Password User</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleResetPassword}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Password Baru</Form.Label>
                <Form.Control name="newPassword" type="password" required minLength={6} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowResetModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={resetLoading}>
                {resetLoading ? "Menyimpan..." : "Reset"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Riwayat Pesanan Modal */}
        <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Riwayat Pesanan User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {historyLoading ? (
              <div className="text-center py-4">
                <Spinner />
              </div>
            ) : historyOrders.length === 0 ? (
              <div className="text-muted">Belum ada riwayat pesanan.</div>
            ) : (
              <div className="table-responsive">
                <Table size="sm" bordered hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Mobil</th>
                      <th>Tgl Sewa</th>
                      <th>Tgl Kembali</th>
                      <th>Status</th>
                      <th>Pembayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.layanan?.nama || "-"}</td>
                        <td>{moment(order.pickup_date).format("DD/MM/YYYY")}</td>
                        <td>{moment(order.return_date).format("DD/MM/YYYY")}</td>
                        <td>
                          <Badge bg={
                            order.status === "completed" ? "success" :
                            order.status === "confirmed" ? "info" :
                            order.status === "pending" ? "warning" :
                            order.status === "cancelled" ? "danger" : "secondary"
                          }>
                            {order.status}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={
                            order.payment_status === "paid" ? "success" :
                            order.payment_status === "pending_verification" ? "warning" :
                            order.payment_status === "rejected" ? "danger" : "secondary"
                          }>
                            {order.payment_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Modal.Body>
        </Modal>

        {/* Kirim Notifikasi Modal */}
        <Modal show={showNotifModal} onHide={() => setShowNotifModal(false)} centered>
          <Form onSubmit={handleSendNotifBlast}>
            <Modal.Header closeButton>
              <Modal.Title>Kirim Notifikasi ke Semua User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Pesan Notifikasi</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={notifMessage}
                  onChange={e => setNotifMessage(e.target.value)}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowNotifModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" disabled={notifLoading}>
                {notifLoading ? "Mengirim..." : "Kirim"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default UsersPage;