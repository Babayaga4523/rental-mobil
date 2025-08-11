import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, Spinner, Badge, Button, Modal,
  InputGroup, Form, Toast, ToastContainer, Row, Col, Card,
  Pagination, Nav, Container, FloatingLabel
} from "react-bootstrap";
import {
  FaEllipsisV, FaEdit, FaTrashAlt, FaFileCsv, FaUser,
  FaHistory, FaKey, FaBell, FaPlus, FaSearch,
  FaRegCheckCircle, FaRegClock, FaUserShield, FaUserCircle,
  FaUserCheck, FaUserTimes
} from "react-icons/fa";
import { CSVLink } from "react-csv";
import { toast as toastify } from "react-toastify";
import './UsersPage.css';
import { API_URL } from "../utils/api";

const UsersPage = ({ darkMode }) => {
  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0, active: 0, inactive: 0, admin: 0, user: 0
  });

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showBlast, setShowBlast] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form state
  const [form, setForm] = useState({ name: "", email: "", no_telp: "", role: "user", status: "active" });
  const [resetPassword, setResetPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [blastMessage, setBlastMessage] = useState("");
  const [formTab, setFormTab] = useState('edit');

  // Glass morphism style
  const glassStyle = {
    background: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
  };

  // Fetch users
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users`);
      const data = res.data.data || [];
      setUsers(data);
      setStats({
        total: data.length,
        active: data.filter(u => u.status === "active").length,
        inactive: data.filter(u => u.status !== "active").length,
        admin: data.filter(u => u.role === "admin").length,
        user: data.filter(u => u.role === "user").length,
      });
    } catch {
      setUsers([]);
      showToast("Gagal mengambil data user", "danger");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, variant = "success") => {
    if (variant === "success") {
      toastify.success(message, {
        position: "top-right",
        autoClose: 2500,
        theme: darkMode ? "dark" : "colored",
        icon: "✅"
      });
    } else if (variant === "danger") {
      toastify.error(message, {
        position: "top-right",
        autoClose: 3500,
        theme: darkMode ? "dark" : "colored",
        icon: "❌"
      });
    } else {
      toastify.info(message, {
        position: "top-right",
        autoClose: 3000,
        theme: darkMode ? "dark" : "colored",
        icon: "ℹ️"
      });
    }
  };

  // UserAvatar component dengan efek shadow dan border neon
  const UserAvatar = ({ name, role, photo }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'US';
    const gradient = role === 'admin'
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    const photoUrl = photo
      ? photo.startsWith("/uploads/")
        ? `${API_URL.replace(/\/api$/, "")}${photo}`
        : photo
      : null;
    return photoUrl ? (
      <img
        src={photoUrl}
        alt={name}
        style={{
          width: 40,
          height: 40,
          objectFit: "cover",
          borderRadius: "50%",
          border: "2px solid #e9ecef",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(78,115,223,0.10)"
        }}
        onError={e => { e.target.src = "/images/default-avatar.png"; }}
      />
    ) : (
      <div
        className="users-avatar-futuristic"
        style={{
          background: gradient,
          width: 40,
          height: 40,
          borderRadius: "50%",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "1.2em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(78,115,223,0.10)"
        }}
      >
        {initials}
      </div>
    );
  };

  // Filtered, sorted and paginated users
  const filteredUsers = users.filter(u => {
    let roleOk = filterRole === "all" || u.role === filterRole;
    let statusOk = filterStatus === "all" || (filterStatus === "active" ? u.status === "active" : u.status !== "active");
    let searchOk = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    return roleOk && statusOk && searchOk;
  });
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // --- CRUD HANDLERS ---
  // Add User
  const handleAddUser = async () => {
    setFormError("");
    if (!form.name || !form.email || !form.no_telp || !form.password) {
      setFormError("Semua field wajib diisi.");
      return;
    }
    try {
      await axios.post(`${API_URL}/users/register`, {
        nama: form.name,
        email: form.email,
        password: form.password,
        no_telp: form.no_telp
      });
      setShowAdd(false);
      fetchUsers();
      showToast("User berhasil ditambahkan", "success");
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || "Gagal menambah user");
    }
  };

  // Edit User
  const handleEditUser = async () => {
    setFormError("");
    if (!form.name || !form.email || !form.no_telp) {
      setFormError("Semua field wajib diisi.");
      return;
    }
    try {
      await axios.put(`${API_URL}/users/${selectedUser.id}`, {
        nama: form.name,
        email: form.email,
        no_telp: form.no_telp,
        role: form.role,
        status: form.status
      });
      setShowEdit(false);
      fetchUsers();
      showToast("User berhasil diupdate", "success");
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || "Gagal update user");
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser?.id) {
      showToast("User tidak valid", "danger");
      return;
    }
    try {
      await axios.delete(`${API_URL}/users/${selectedUser.id}`);
      setShowDelete(false);
      fetchUsers();
      showToast("User berhasil dihapus", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || "Gagal menghapus user", "danger");
    }
  };

  // Reset Password (admin reset, tidak perlu oldPassword)
  const handleResetPassword = async () => {
    if (!resetPassword || !selectedUser) return;
    setFormError("");
    try {
      await axios.put(`${API_URL}/users/${selectedUser.id}/password`, {
        newPassword: resetPassword
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showToast("Password berhasil direset", "success");
      setShowReset(false);
      setShowEdit(false);
      setResetPassword("");
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || "Gagal reset password");
    }
  };

  // Notifikasi blast (kirim notifikasi ke semua user via backend dengan pesan)
  const handleNotifBlast = async () => {
    setShowBlast(true);
  };

  const handleSendBlast = async () => {
    if (!blastMessage.trim()) {
      showToast("Pesan tidak boleh kosong", "danger");
      return;
    }
    try {
      await axios.post(`${API_URL}/notifications/blast`, { message: blastMessage }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showToast("Notifikasi berhasil dikirim ke semua user", "success");
      setShowBlast(false);
      setBlastMessage("");
    } catch (err) {
      showToast(err?.response?.data?.message || "Gagal mengirim notifikasi blast", "danger");
    }
  };

  // --- RENDER ---
  return (
    <Container fluid className={`px-4 py-4 ${darkMode ? "bg-dark text-light" : "bg-light"}`}>
      {/* Header */}
      <Card className="border-0 mb-4" style={glassStyle}>
        <Card.Body className="py-3">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FaUserCircle className="text-primary" size={32} />
                </div>
                <div>
                  <h2 className="fw-bold mb-0">User Management</h2>
                  <p className="text-muted mb-0">Manage all system users</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <Button
                variant="primary"
                onClick={() => {
                  setForm({ name: "", email: "", no_telp: "", role: "user", status: "active" });
                  setFormError("");
                  setShowAdd(true);
                }}
                className="me-2"
              >
                <FaPlus className="me-1" /> Add User
              </Button>
              <Button
                variant="info"
                onClick={handleNotifBlast}
              >
                <FaBell className="me-1" /> Notify
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Cards */}
      <Row className="mb-4 g-4">
        {[
          {
            title: "Total Users",
            value: stats.total,
            icon: <FaUser className="text-primary bg-light rounded-circle p-2 shadow-sm" size={32} />, // Bootstrap icon style
            color: "primary"
          },
          {
            title: "Active",
            value: stats.active,
            icon: <FaUserCheck className="text-success bg-light rounded-circle p-2 shadow-sm" size={32} />, // Bootstrap icon style
            color: "success"
          },
          {
            title: "Admins",
            value: stats.admin,
            icon: <FaUserShield className="text-info bg-light rounded-circle p-2 shadow-sm" size={32} />, // Bootstrap icon style
            color: "info"
          },
          {
            title: "Inactive",
            value: stats.inactive,
            icon: <FaUserTimes className="text-warning bg-light rounded-circle p-2 shadow-sm" size={32} />, // Bootstrap icon style
            color: "warning"
          }
        ].map((stat, index) => (
          <Col xl={3} lg={6} md={6} key={index}>
            <Card className="border-0 shadow h-100 text-center py-3 stats-card-bootstrap">
              <Card.Body>
                <div className="d-flex flex-column align-items-center justify-content-center gap-2">
                  <div>{stat.icon}</div>
                  <h6 className="text-uppercase text-muted mb-1 small fw-bold">{stat.title}</h6>
                  <h2 className={`mb-0 fw-bold text-${stat.color}`}>{stat.value}</h2>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filter and Search */}
      <Card className="border-0 mb-4" style={glassStyle}>
        <Card.Body>
          <Row className="g-3 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className={`bg-transparent ${darkMode ? 'text-light' : ''}`}>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search users..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className={`${darkMode ? 'bg-dark text-light border-dark' : ''}`}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <FloatingLabel controlId="floatingRole" label="Role">
                <Form.Select
                  value={filterRole}
                  onChange={e => {
                    setFilterRole(e.target.value);
                    setPage(1);
                  }}
                  className={`${darkMode ? 'bg-dark text-light border-dark' : ''}`}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col md={3}>
              <FloatingLabel controlId="floatingStatus" label="Status">
                <Form.Select
                  value={filterStatus}
                  onChange={e => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className={`${darkMode ? 'bg-dark text-light border-dark' : ''}`}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col md={2}>
              <CSVLink
                data={pagedUsers}
                headers={[
                  { label: "ID", key: "id" },
                  { label: "Name", key: "name" },
                  { label: "Email", key: "email" },
                  { label: "Phone", key: "no_telp" },
                  { label: "Role", key: "role" },
                  { label: "Status", key: "status" }
                ]}
                filename={`users-export-${new Date().toISOString()}.csv`}
                className={`btn btn-outline-primary w-100 ${darkMode ? 'border-light' : ''}`}
              >
                <FaFileCsv className="me-1" /> Export
              </CSVLink>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Status Tabs */}
      <Nav
        variant="pills"
        activeKey={activeTab}
        onSelect={setActiveTab}
        className="mb-4 px-2 py-2 rounded-pill"
        style={{
          background: darkMode
            ? "linear-gradient(90deg, #232526 0%, #414345 100%)"
            : "linear-gradient(90deg, #f8fafc 0%, #e0e7ef 100%)",
          boxShadow: "0 2px 12px rgba(78,115,223,0.07)",
          borderRadius: "2rem",
          border: darkMode ? "1px solid #333" : "1px solid #e9ecef"
        }}
      >
        {[
          { key: "all", label: "All", count: stats.total, icon: <FaUser className="me-1" /> },
          { key: "active", label: "Active", count: stats.active, icon: <FaUserCheck className="me-1" /> },
          { key: "admin", label: "Admins", count: stats.admin, icon: <FaUserShield className="me-1" /> },
          { key: "inactive", label: "Inactive", count: stats.inactive, icon: <FaUserTimes className="me-1" /> }
        ].map(tab => (
          <Nav.Item key={tab.key} className="me-2">
            <Nav.Link
              eventKey={tab.key}
              className={`d-flex align-items-center fw-semibold px-4 py-2 rounded-pill border-0 ${
                activeTab === tab.key
                  ? darkMode
                    ? "bg-primary text-light shadow"
                    : "bg-primary text-white shadow"
                  : darkMode
                    ? "text-light"
                    : "text-dark"
              }`}
              style={{
                transition: "all 0.2s",
                fontSize: "1rem",
                marginBottom: "2px"
              }}
            >
              {tab.icon}
              {tab.label}
              <Badge
                bg={activeTab === tab.key ? "light" : "secondary"}
                text={activeTab === tab.key ? "primary" : undefined}
                className="ms-2 px-2 py-1 rounded-pill"
                style={{
                  fontWeight: 600,
                  fontSize: "0.95em",
                  boxShadow: activeTab === tab.key ? "0 2px 8px rgba(78,115,223,0.10)" : undefined
                }}
              >
                {tab.count}
              </Badge>
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Users Table */}
      <Card className="border-0 mb-4 users-table-container-futuristic" style={glassStyle}>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className={darkMode ? "bg-dark text-light" : "bg-light"}>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end sticky-action-col" style={{ minWidth: 120, right: 0, zIndex: 2, position: 'sticky', background: darkMode ? '#23272f' : '#fff' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : pagedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No users found
                    </td>
                  </tr>
                ) : (
                  pagedUsers.map(user => (
                    <tr key={user.id} className="transition-all" style={{ transition: 'all 0.2s ease' }}>
                      <td className="fw-bold">#{user.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <UserAvatar name={user.name} role={user.role} photo={user.photo} />
                          <div className="ms-3">
                            <div className="fw-semibold">{user.name}</div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{user.no_telp || '-'}</div>
                      </td>
                      <td>
                        <Badge
                          pill
                          bg={user.role === 'admin' ? 'primary' : 'secondary'}
                          className="px-3 py-2"
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          pill
                          bg={user.status === 'active' ? 'success' : 'danger'}
                          className="px-3 py-2"
                        >
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-end">
                        <Button
                          variant={darkMode ? "outline-light" : "outline-secondary"}
                          size="sm"
                          className="px-2"
                          onClick={() => {
                            setSelectedUser(user);
                            setForm({
                              name: user.name,
                              email: user.email,
                              no_telp: user.no_telp,
                              role: user.role,
                              status: user.status
                            });
                            setFormError("");
                            setShowEdit(true); // Modal multi-fitur akan dibuka
                          }}
                        >
                          <FaEllipsisV />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted">
          Showing {pagedUsers.length} of {filteredUsers.length} users
        </div>
        <Pagination className="users-pagination-futuristic">
          <Pagination.Prev
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className={darkMode ? 'text-light' : ''}
          />
          {Array.from({ length: totalPages }).map((_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={page === idx + 1}
              onClick={() => setPage(idx + 1)}
              className={darkMode ? (page === idx + 1 ? 'bg-primary' : 'bg-dark text-light') : ''}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className={darkMode ? 'text-light' : ''}
          />
        </Pagination>
      </div>

      {/* Add User Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered className="users-modal-futuristic">
        <Modal.Header closeButton className={darkMode ? "bg-dark text-light" : ""}>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
          <Form>
            <FloatingLabel controlId="floatingName" label="Name" className="mb-3">
              <Form.Control
                placeholder="Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={darkMode ? "bg-dark text-light" : ""}
              />
            </FloatingLabel>
            <FloatingLabel controlId="floatingEmail" label="Email" className="mb-3">
              <Form.Control
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={darkMode ? "bg-dark text-light" : ""}
              />
            </FloatingLabel>
            <FloatingLabel controlId="floatingPhone" label="Phone" className="mb-3">
              <Form.Control
                placeholder="Phone"
                value={form.no_telp}
                onChange={e => setForm(f => ({ ...f, no_telp: e.target.value }))}
                className={darkMode ? "bg-dark text-light" : ""}
              />
            </FloatingLabel>
            <FloatingLabel controlId="floatingPassword" label="Password" className="mb-3">
              <Form.Control
                type="password"
                placeholder="Password"
                value={form.password || ""}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={darkMode ? "bg-dark text-light" : ""}
                minLength={6}
                required
              />
            </FloatingLabel>
          </Form>
          {formError && <div className="text-danger mt-2">{formError}</div>}
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark" : ""}>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleAddUser}>Add User</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered className="users-modal-futuristic" size="lg">
        <Modal.Header closeButton className={darkMode ? "bg-dark text-light" : ""}>
          <Modal.Title>User Actions</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
          <Row>
            <Col md={4} className="border-end pe-4 mb-3 mb-md-0">
              <div className="d-flex flex-column gap-3">
                <Button variant="outline-primary" className="w-100 text-start d-flex align-items-center gap-2" onClick={() => setFormTab('edit')}><FaEdit /> Edit</Button>
                <Button variant="outline-info" className="w-100 text-start d-flex align-items-center gap-2" onClick={() => setFormTab('history')}><FaHistory /> History</Button>
                <Button variant="outline-warning" className="w-100 text-start d-flex align-items-center gap-2" onClick={() => setFormTab('reset')}><FaKey /> Reset Password</Button>
                <Button variant="outline-danger" className="w-100 text-start d-flex align-items-center gap-2" onClick={() => setFormTab('delete')}><FaTrashAlt /> Delete</Button>
              </div>
            </Col>
            <Col md={8}>
              {formTab === 'edit' && (
                <div>
                  <h5>Edit User</h5>
                  <Form>
                    <FloatingLabel controlId="floatingEditName" label="Name" className="mb-3">
                      <Form.Control
                        placeholder="Name"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className={darkMode ? "bg-dark text-light" : ""}
                      />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingEditEmail" label="Email" className="mb-3">
                      <Form.Control
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className={darkMode ? "bg-dark text-light" : ""}
                      />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingEditPhone" label="Phone" className="mb-3">
                      <Form.Control
                        placeholder="Phone"
                        value={form.no_telp}
                        onChange={e => setForm(f => ({ ...f, no_telp: e.target.value }))}
                        className={darkMode ? "bg-dark text-light" : ""}
                      />
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingEditRole" label="Role" className="mb-3">
                      <Form.Select
                        value={form.role}
                        onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                        className={darkMode ? "bg-dark text-light" : ""}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </Form.Select>
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingEditStatus" label="Status" className="mb-3">
                      <Form.Select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        className={darkMode ? "bg-dark text-light" : ""}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Form.Select>
                    </FloatingLabel>
                  </Form>
                  {formError && <div className="text-danger mt-2">{formError}</div>}
                  <div className="mt-3 text-end">
                    <Button variant="primary" onClick={handleEditUser}>Save Changes</Button>
                  </div>
                </div>
              )}
              {formTab === 'history' && (
                <div>
                  <h5>Order History</h5>
                  <UserHistoryContent userId={selectedUser?.id} darkMode={darkMode} />
                </div>
              )}
              {formTab === 'reset' && (
                <div>
                  <h5>Reset Password</h5>
                  <Form onSubmit={e => { e.preventDefault(); handleResetPassword(); }}>
                    <FloatingLabel controlId="floatingPassword" label="New Password" className="mb-3">
                      <Form.Control
                        type="password"
                        placeholder="New Password"
                        value={resetPassword}
                        onChange={e => setResetPassword(e.target.value)}
                        className={darkMode ? "bg-dark text-light" : ""}
                        minLength={6}
                        required
                      />
                    </FloatingLabel>
                    {formError && <div className="text-danger mb-2">{formError}</div>}
                    <div className="mt-3 text-end">
                      <Button variant="warning" type="submit">Reset Password</Button>
                    </div>
                  </Form>
                </div>
              )}
              {formTab === 'delete' && (
                <div>
                  <h5>Delete User</h5>
                  <p>Are you sure you want to delete user <b>{selectedUser?.name}</b>? This action cannot be undone.</p>
                  <div className="mt-3 text-end">
                    <Button variant="danger" onClick={handleDeleteUser}>Delete</Button>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* Delete User Modal */}
      <Modal show={showDelete} onHide={() => setShowDelete(false)} centered className="users-modal-futuristic">
        <Modal.Header closeButton className={darkMode ? "bg-dark text-light" : ""}>
          <Modal.Title>Delete User</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
          Are you sure you want to delete user <b>{selectedUser?.name}</b>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark" : ""}>
          <Button variant="secondary" onClick={() => setShowDelete(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteUser}>Delete</Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Password Modal */}
      <Modal show={showReset} onHide={() => setShowReset(false)} centered className="users-modal-futuristic">
        <Modal.Header closeButton className={darkMode ? "bg-dark text-light" : ""}>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
          <Form>
            <FloatingLabel controlId="floatingPassword" label="New Password" className="mb-3">
              <Form.Control
                type="password"
                placeholder="New Password"
                value={resetPassword}
                onChange={e => setResetPassword(e.target.value)}
                className={darkMode ? "bg-dark text-light" : ""}
              />
            </FloatingLabel>
          </Form>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark" : ""}>
          <Button variant="secondary" onClick={() => setShowReset(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleResetPassword}>Reset Password</Button>
        </Modal.Footer>
      </Modal>

      {/* User History Modal */}
      <Modal show={showHistory} onHide={() => setShowHistory(false)} centered size="lg" className="users-modal-futuristic">
        <Modal.Header closeButton className={darkMode ? "bg-dark text-light" : ""}>
          <Modal.Title>User History</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
          {selectedUser ? (
            <UserHistoryContent userId={selectedUser.id} darkMode={darkMode} />
          ) : (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark" : ""}>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Blast Notification Modal */}
      <Modal show={showBlast} onHide={() => setShowBlast(false)} centered className="users-modal-futuristic">
        <Modal.Header closeButton className={darkMode ? "bg-dark text-light" : ""}>
          <Modal.Title>Kirim Notifikasi Blast</Modal.Title>
        </Modal.Header>
        <Modal.Body className={darkMode ? "bg-dark text-light" : ""}>
          <Form>
            <FloatingLabel controlId="floatingBlastMsg" label="Pesan Notifikasi" className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Tulis pesan notifikasi..."
                value={blastMessage}
                onChange={e => setBlastMessage(e.target.value)}
                className={darkMode ? "bg-dark text-light" : ""}
              />
            </FloatingLabel>
          </Form>
        </Modal.Body>
        <Modal.Footer className={darkMode ? "bg-dark" : ""}>
          <Button variant="secondary" onClick={() => setShowBlast(false)}>Batal</Button>
          <Button variant="primary" onClick={handleSendBlast}>Kirim</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// --- UserHistoryContent Component ---
const UserHistoryContent = ({ userId, darkMode }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch order history for user
        const res = await axios.get(`${API_URL}/users/${userId}/history`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setHistory(res.data.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Gagal mengambil riwayat pesanan user");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  if (loading) return (
    <div className="text-center py-4">
      <Spinner animation="border" variant="primary" />
      <div className="mt-2">Loading order history...</div>
    </div>
  );
  if (error) return (
    <div className="text-center py-4 text-danger">
      <FaRegClock size={32} className="mb-2" />
      <div>{error}</div>
    </div>
  );
  if (!history.length) return (
    <div className="text-center py-4 text-muted">
      <FaHistory size={32} className="mb-2" />
      <div>No order history found for this user.</div>
    </div>
  );
  return (
    <div className="user-history-list-futuristic">
      <Table striped bordered hover responsive className={darkMode ? "bg-dark text-light" : "bg-light"}>
        <thead>
          <tr>
            <th>#</th>
            <th>Order ID</th>
            <th>Car</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {history.map((order, idx) => (
            <tr key={order.id || idx}>
              <td>{idx + 1}</td>
              <td>{order.id || '-'}</td>
              <td>{order.car_name || order.car?.name || '-'}</td>
              <td>{order.start_date ? new Date(order.start_date).toLocaleDateString() : '-'}</td>
              <td>{order.end_date ? new Date(order.end_date).toLocaleDateString() : '-'}</td>
              <td>
                <Badge bg={order.status === 'completed' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>
                  {order.status || '-'}
                </Badge>
              </td>
              <td>{order.total_price ? `Rp${order.total_price.toLocaleString()}` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UsersPage;