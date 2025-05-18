import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, Spinner, Alert, Badge, Dropdown, Button, Modal, InputGroup, Form, Toast, ToastContainer
} from "react-bootstrap";
import { FaEllipsisV, FaEdit, FaTrash, FaFileCsv, FaUser, FaMoon, FaSun, FaSortUp, FaSortDown } from "react-icons/fa";
import { CSVLink } from "react-csv";

const API_URL = "http://localhost:3000/api";
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const UsersPage = () => {
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
  const [darkMode, setDarkMode] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);

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
    if (sortConfig.key !== key) return <span className="ms-1 text-muted"><FaFileCsv /></span>;
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
    { label: "Role", key: "role" },
    { label: "Status", key: "status" }
  ];
  const formatCSVData = (users) =>
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status === "active" ? "Aktif" : "Nonaktif"
    }));

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

  // Dark mode toggle
  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0"><FaUser className="me-2" />Daftar Pengguna</h3>
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
              placeholder="Cari nama/email/ID..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
          <Form.Select
            value={filterRole}
            onChange={e => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 160 }}
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </Form.Select>
          <Form.Select
            value={filterStatus}
            onChange={e => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 160 }}
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </Form.Select>
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
            data={formatCSVData(sortedUsers)}
            headers={csvHeaders}
            filename={`daftar-user-${Date.now()}.csv`}
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
        <div className="d-flex justify-content-between align-items-center mt-3">
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
      </div>
    </div>
  );
};

export default UsersPage;