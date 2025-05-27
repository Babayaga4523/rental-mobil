import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, Spinner, Alert, Badge, Dropdown, Button, Modal, Form, InputGroup, Toast, ToastContainer, Row, Col, Card
} from "react-bootstrap";
import { FaEllipsisV, FaEdit, FaTrash, FaPlus, FaSort, FaSortUp, FaSortDown, FaFileCsv, FaFileExcel, FaCar, FaMoon, FaSun, FaEye, FaStar } from "react-icons/fa";
import { CSVLink } from "react-csv";
import * as XLSX from "xlsx";
import moment from "moment";

const API_URL = "http://localhost:3000/api";
const BACKEND_URL = "http://localhost:3000";
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const CarsPage = ({ darkMode, toggleDarkMode }) => {
  const [cars, setCars] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailCar, setDetailCar] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKategori, setFilterKategori] = useState("all");
  const [filterPromo, setFilterPromo] = useState("all");
  const [filterHarga, setFilterHarga] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [formImage, setFormImage] = useState(null);
  // Tambahkan filter di filter & search
  const [filterSewaAktif, setFilterSewaAktif] = useState(false);
  const [omzetMap, setOmzetMap] = useState({});

  // Tambahkan fungsi ini:
  const getOmzet = (carId) => omzetMap[carId] || 0;

  const token = localStorage.getItem("token");

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/layanan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCars(
        Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : []
      );
    } catch (err) {
      setCars([]);
      showToast("Gagal memuat data mobil!", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setOrders([]);
    }
  };

  const fetchOmzet = async () => {
    try {
      const res = await axios.get(`${API_URL}/layanan/omzet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const map = {};
      (res.data.data || []).forEach(item => {
        map[item.layanan_id] = Number(item.total_omzet || 0);
      });
      setOmzetMap(map);
    } catch {
      setOmzetMap({});
    }
  };

  useEffect(() => {
    fetchCars();
    fetchOrders();
    fetchOmzet();
    // eslint-disable-next-line
  }, [token]);

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
    setTimeout(() => setToast({ ...toast, show: false }), 2500);
  };

  // --- PINDAHKAN getSewaAktif KE ATAS SEBELUM filteredCars ---
  const getSewaAktif = (carId) => {
    const now = moment();
    const aktif = orders.find(order =>
      order.layanan?.id === carId &&
      ["pending", "confirmed"].includes(order.status) &&
      moment(order.pickup_date).isSameOrBefore(now, "day") &&
      moment(order.return_date).isSameOrAfter(now, "day")
    );
    if (aktif) {
      return `${moment(aktif.pickup_date).format("DD/MM/YYYY")} - ${moment(aktif.return_date).format("DD/MM/YYYY")}`;
    }
    return "-";
  };

  const getDisewa = (carId) =>
    orders.filter(order => order.layanan?.id === carId).length;

  // Jumlah order aktif hari ini (disewa hari ini)
  const getDisewaHariIni = (carId) => {
    const today = moment().startOf('day');
    return orders.filter(order =>
      order.layanan?.id === carId &&
      ["pending", "confirmed"].includes(order.status) &&
      moment(order.pickup_date).startOf('day').isSameOrBefore(today) &&
      moment(order.return_date).startOf('day').isSameOrAfter(today)
    ).length;
  };

  // Ambil semua kategori unik
  const kategoriList = [
    ...new Set(cars.map(car => car.kategori).filter(Boolean))
  ];

  // Filter & Search
  const filteredCars = cars.filter(car => {
    const searchLower = search.toLowerCase();
    const matchSearch =
      car.nama?.toLowerCase().includes(searchLower) ||
      car.kategori?.toLowerCase().includes(searchLower) ||
      car.id.toString().includes(searchLower);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "available" && car.status === "available") ||
      (filterStatus === "unavailable" && car.status === "unavailable");
    const matchKategori =
      filterKategori === "all" || car.kategori === filterKategori;
    const matchPromo =
      filterPromo === "all" ||
      (filterPromo === "promo" && car.promo && car.promo > 0) ||
      (filterPromo === "no_promo" && (!car.promo || car.promo === 0));
    const matchHarga =
      !filterHarga ||
      (Number(car.harga) >= Number(filterHarga));
    // Tambahkan filter untuk sewa aktif
    const matchSewaAktif = !filterSewaAktif || getSewaAktif(car.id) !== "-";
    return matchSearch && matchStatus && matchKategori && matchPromo && matchHarga && matchSewaAktif;
  });

  // Sorting
  const sortedCars = [...filteredCars].sort((a, b) => {
    const { key, direction } = sortConfig;
    let valA = a[key], valB = b[key];
    if (key === "harga") {
      valA = Number(a.harga) || 0;
      valB = Number(b.harga) || 0;
    }
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedCars.length / pageSize);
  const pagedCars = sortedCars.slice((page - 1) * pageSize, page * pageSize);

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
    { label: "Nama Mobil", key: "nama" },
    { label: "Kategori", key: "kategori" },
    { label: "Harga", key: "harga" },
    { label: "Promo (%)", key: "promo" },
    { label: "Status", key: "status" },
    { label: "Disewa", key: "disewa" },
    { label: "Omzet", key: "omzet" },
    { label: "Rating", key: "rating" }
  ];
  const formatCSVData = (cars) =>
    cars.map((car) => ({
      id: car.id,
      nama: car.nama,
      kategori: car.kategori || "",
      harga: car.harga ? Number(car.harga).toLocaleString("id-ID") : "",
      promo: car.promo || 0,
      status: car.status === "available" ? "Tersedia" : "Tidak Tersedia",
      disewa: car.disewa || 0,
      omzet: car.omzet ? Number(car.omzet).toLocaleString("id-ID") : "0",
      rating: car.rating || "-"
    }));

  // Excel Export
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(formatCSVData(sortedCars));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mobil");
    XLSX.writeFile(wb, `daftar-mobil-${Date.now()}.xlsx`);
  };

  // Modal helpers
  const handleShowDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const handleShowDetailModal = async (car) => {
    try {
      const res = await axios.get(`${API_URL}/layanan/${car.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetailCar(res.data.data || car);
      setShowDetailModal(true);
    } catch {
      setDetailCar(car);
      setShowDetailModal(true);
    }
  };
  const handleShowFormModal = (car = null) => {
    setEditCar(car);
    setFormImage(null);
    setShowFormModal(true);
  };

  // Delete
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/layanan/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCars(cars => cars.filter(c => c.id !== deleteId));
      setShowDeleteModal(false);
      showToast("Mobil berhasil dihapus!");
    } catch (err) {
      showToast("Gagal menghapus mobil!", "danger");
    }
  };

  // Add/Edit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData();

    // Wajib
    data.append("nama", form.nama.value.trim());
    data.append("kategori", form.kategori.value.trim());
    data.append("harga", form.harga.value);
    data.append("status", form.status.value);
    data.append("deskripsi", form.deskripsi.value.trim());

    // Opsional
    if (formImage) data.append("gambar", formImage);
    if (form.promo.value && Number(form.promo.value) > 0) data.append("promo", form.promo.value);
    if (form.transmisi.value) data.append("transmisi", form.transmisi.value);
    if (form.kapasitas.value && Number(form.kapasitas.value) > 0) data.append("kapasitas", form.kapasitas.value);

    // Fitur: pastikan array string
    if (form.fitur.value) {
      data.append("fitur", form.fitur.value); // cukup string, misal: "AC, Bluetooth"
    }

    try {
      if (editCar) {
        await axios.put(`${API_URL}/layanan/${editCar.id}`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
        showToast("Mobil berhasil diupdate!");
      } else {
        await axios.post(`${API_URL}/layanan`, data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
        showToast("Mobil berhasil ditambahkan!");
      }
      setShowFormModal(false);
      fetchCars();
    } catch (err) {
      showToast("Gagal menyimpan data mobil!", "danger");
    }
  };

  const getHargaSetelahPromo = (car) => {
    if (car.promo && car.promo > 0) {
      return Math.round(car.harga - (car.harga * car.promo / 100));
    }
    return car.harga;
  };

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

  // Statistik pemakaian mobil (jumlah disewa & omzet)
  useEffect(() => {
    // Ambil statistik dari backend jika ada endpoint, atau hitung manual dari relasi order jika tersedia
    // Contoh: backend sudah menambahkan field disewa & omzet pada response mobil
    // Jika belum, bisa fetch /api/orders dan hitung manual di sini
  }, [cars]);

  const getRiwayatSewa = (carId) => {
    return orders
      .filter(order => order.layanan?.id === carId)
      .sort((a, b) => new Date(b.pickup_date) - new Date(a.pickup_date));
  };

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <div className="container-fluid py-4">
        {/* Header */}
        <Row className="align-items-center mb-4">
          <Col xs={12} md={6}>
            <h3 className="mb-0 fw-bold">
              <FaCar className="me-2" />
              Daftar Mobil
            </h3>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
            <Button
              variant={darkMode ? "light" : "dark"}
              onClick={toggleDarkMode}
              title={darkMode ? "Light Mode" : "Dark Mode"}
              className="me-2"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </Button>
            <Button variant="success" onClick={() => handleShowFormModal()} className="fw-bold">
              <FaPlus className="me-2" />Tambah Mobil
            </Button>
          </Col>
        </Row>
        {/* Filter & Export */}
        <Card className={`mb-4 shadow-sm border-0 ${darkMode ? "bg-secondary" : "bg-white"}`}>
          <Card.Body>
            <Row className="g-2 align-items-center">
              <Col xs={12} md={3}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Cari nama/kategori/ID..."
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </InputGroup>
              </Col>
              <Col xs={6} md={2}>
                <Form.Select
                  value={filterStatus}
                  onChange={e => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Semua Status</option>
                  <option value="available">Tersedia</option>
                  <option value="unavailable">Tidak Tersedia</option>
                </Form.Select>
              </Col>
              <Col xs={6} md={2}>
                <Form.Select
                  value={filterKategori}
                  onChange={e => {
                    setFilterKategori(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Semua Kategori</option>
                  {kategoriList.map(kat => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6} md={2}>
                <Form.Select
                  value={filterPromo}
                  onChange={e => {
                    setFilterPromo(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">Promo/Non Promo</option>
                  <option value="promo">Promo</option>
                  <option value="no_promo">Tanpa Promo</option>
                </Form.Select>
              </Col>
              <Col xs={6} md={1}>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder="Min Harga"
                  value={filterHarga}
                  onChange={e => {
                    setFilterHarga(e.target.value);
                    setPage(1);
                  }}
                />
              </Col>
              <Col xs={12} md={2} className="d-flex align-items-center gap-2 mt-2 mt-md-0">
                <Form.Check
                  type="checkbox"
                  label="Sedang disewa"
                  checked={filterSewaAktif}
                  onChange={e => setFilterSewaAktif(e.target.checked)}
                  className="me-2"
                />
                <CSVLink
                  data={formatCSVData(sortedCars)}
                  headers={csvHeaders}
                  filename={`daftar-mobil-${Date.now()}.csv`}
                  className="btn btn-outline-success"
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
            <div className="mt-2">Memuat data mobil...</div>
          </div>
        ) : pagedCars.length === 0 ? (
          <Alert variant="info" className="rounded-3 shadow-sm">Tidak ada data mobil.</Alert>
        ) : (
          <div className="table-responsive shadow-sm rounded-4" style={{ maxHeight: 600, overflowX: "auto" }}>
            <Table
              striped
              bordered
              hover
              className={`align-middle mb-0 ${darkMode ? "table-dark" : ""}`}
              style={{ minWidth: 1200 }}
            >
              <thead className={darkMode ? "table-secondary" : "table-light"} style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("id")}>
                    ID {getSortIcon("id")}
                  </th>
                  <th>Gambar</th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("nama")}>
                    Nama Mobil {getSortIcon("nama")}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("kategori")}>
                    Kategori {getSortIcon("kategori")}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("harga")}>
                    Harga {getSortIcon("harga")}
                  </th>
                  <th>Promo</th>
                  <th>Status</th>
                  <th>Disewa</th>
                  <th>Disewa Saat Ini</th>
                  <th>Omzet</th>
                  <th>Rating</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedCars.map(car => (
                  <tr key={car.id}>
                    <td>
                      <Badge bg="secondary" className="fw-bold rounded-pill px-3 py-2 fs-6">
                        #{car.id}
                      </Badge>
                    </td>
                    <td>
                      <div
                        className="bg-light rounded border"
                        style={{
                          width: '80px',
                          height: '50px',
                          backgroundImage: car.gambar
                            ? `url(${car.gambar.startsWith("http") ? car.gambar : BACKEND_URL + car.gambar})`
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      ></div>
                    </td>
                    <td className="fw-semibold">{car.nama}</td>
                    <td>{car.kategori || '-'}</td>
                    <td>
                      {car.promo && car.promo > 0 ? (
                        <>
                          <span style={{ textDecoration: "line-through", color: "#bbb", marginRight: 6 }}>
                            Rp {car.harga?.toLocaleString('id-ID')}
                          </span>
                          <Badge bg="warning" text="dark" className="ms-1">
                            Promo {car.promo}%
                          </Badge>
                          <br />
                          <span className="fw-bold text-success">
                            Rp {getHargaSetelahPromo(car).toLocaleString('id-ID')}
                          </span>
                        </>
                      ) : (
                        <>Rp {car.harga?.toLocaleString('id-ID')}</>
                      )}
                    </td>
                    <td>
                      {car.promo && car.promo > 0 ? (
                        <Badge bg="warning" text="dark">{car.promo}%</Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Badge pill bg={car.status === 'available' ? 'success' : 'danger'}>
                        {car.status === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg="info">{getDisewa(car.id)}x</Badge>
                    </td>
                    <td>
                      {/* Disewa Hari Ini */}
                      {getDisewaHariIni(car.id) > 0 ? (
                        <Badge bg="primary">{getDisewaHariIni(car.id)}x</Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className="fw-bold text-success">
                        Rp{getOmzet(car.id).toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td>
                      {car.rating ? (
                        <>
                          <FaStar className="text-warning mb-1" /> {car.rating} <span className="text-muted">({car.jumlah_review || 0})</span>
                        </>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Dropdown>
                        <Dropdown.Toggle variant={darkMode ? "secondary" : "light"} size="sm" id="dropdown-actions">
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleShowDetailModal(car)}>
                            <FaEye className="me-2" /> Detail
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleShowFormModal(car)}>
                            <FaEdit className="me-2" /> Edit
                          </Dropdown.Item>
                          <Dropdown.Item className="text-danger" onClick={() => handleShowDeleteModal(car.id)}>
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
            Menampilkan {pagedCars.length} dari {sortedCars.length} mobil
          </div>
          <div>
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>&lt;</button>
                </li>
                {[...Array(totalPages)].map((_, idx) => (
                  <li key={idx} className={`page-item ${page === idx + 1 ? "active" : ""}`}>
                    <button className="page-link" onClick={() => setPage(idx + 1)}>{idx + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>&gt;</button>
                </li>
              </ul>
            </nav>
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
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Detail Mobil</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {detailCar && (
              <Row>
                <Col md={5} className="text-center mb-3 mb-md-0">
                  <img
                    src={
                      detailCar.gambar
                        ? detailCar.gambar.startsWith("http")
                          ? detailCar.gambar
                          : BACKEND_URL + detailCar.gambar
                        : "/no-image.png"
                    }
                    alt={detailCar.nama}
                    style={{ maxWidth: 180, maxHeight: 120, borderRadius: 12, border: "1px solid #ccc" }}
                    onError={e => { e.target.onerror = null; e.target.src = "/no-image.png"; }}
                  />
                </Col>
                <Col md={7}>
                  <p><strong>ID:</strong> #{detailCar.id}</p>
                  <p><strong>Nama Mobil:</strong> {detailCar.nama}</p>
                  <p><strong>Kategori:</strong> {detailCar.kategori || '-'}</p>
                  <p><strong>Harga:</strong>{" "}
                    {detailCar.promo && detailCar.promo > 0 ? (
                      <>
                        <span style={{ textDecoration: "line-through", color: "#bbb", marginRight: 6 }}>
                          Rp {detailCar.harga?.toLocaleString('id-ID')}
                        </span>
                        <Badge bg="warning" text="dark" className="ms-1">
                          Promo {detailCar.promo}%
                        </Badge>
                        <br />
                        <span className="fw-bold text-success">
                          Rp {getHargaSetelahPromo(detailCar).toLocaleString('id-ID')}
                        </span>
                      </>
                    ) : (
                      <>Rp {detailCar.harga?.toLocaleString('id-ID')}</>
                    )}
                  </p>
                  <p><strong>Deskripsi:</strong> {detailCar.deskripsi || '-'}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Badge pill bg={detailCar.status === 'available' ? 'success' : 'danger'}>
                      {detailCar.status === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                    </Badge>
                  </p>
                  <p><strong>Promo:</strong> {detailCar.promo ? `${detailCar.promo}%` : '-'}</p>
                  <p><strong>Transmisi:</strong> {detailCar.transmisi || '-'}</p>
                  <p><strong>Kapasitas:</strong> {detailCar.kapasitas || '-'}</p>
                  <p><strong>Fitur:</strong> <FiturBadges fitur={detailCar.fitur} /></p>
                  <p><strong>Rating:</strong> {detailCar.rating || '-'} ({detailCar.jumlah_review || 0} review)</p>
                  <p><strong>Disewa:</strong> {detailCar.disewa || 0}x</p>
                  <p><strong>Omzet:</strong> Rp{getOmzet(detailCar.id).toLocaleString('id-ID')}</p>
                  <p><strong>Riwayat Sewa:</strong></p>
                  {getRiwayatSewa(detailCar.id).length === 0 ? (
                    <div className="text-muted mb-2">Belum pernah disewa.</div>
                  ) : (
                    <div className="table-responsive mb-2">
                      <Table size="sm" bordered hover>
                        <thead>
                          <tr>
                            <th>Pelanggan</th>
                            <th>Tgl Sewa</th>
                            <th>Tgl Kembali</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getRiwayatSewa(detailCar.id).map((order, idx) => (
                            <tr key={order.id || idx}>
                              <td>{order.user?.name || '-'}</td>
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
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Col>
              </Row>
            )}
          </Modal.Body>
        </Modal>

        {/* Add/Edit Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editCar ? "Edit Mobil" : "Tambah Mobil"}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFormSubmit} encType="multipart/form-data">
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nama Mobil</Form.Label>
                    <Form.Control name="nama" defaultValue={editCar?.nama || ""} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Kategori</Form.Label>
                    <Form.Control name="kategori" defaultValue={editCar?.kategori || ""} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Harga</Form.Label>
                    <Form.Control name="harga" type="number" min={0} defaultValue={editCar?.harga || ""} required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select name="status" defaultValue={editCar?.status || "available"}>
                      <option value="available">Tersedia</option>
                      <option value="unavailable">Tidak Tersedia</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Promo (%)</Form.Label>
                    <Form.Control name="promo" type="number" min={0} max={100} defaultValue={editCar?.promo || ""} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Deskripsi</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="deskripsi"
                      defaultValue={editCar?.deskripsi || ""}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Foto Mobil</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={e => setFormImage(e.target.files[0])}
                    />
                    {editCar?.gambar && (
                      <div className="mt-2">
                        <img
                          src={editCar.gambar.startsWith("http") ? editCar.gambar : BACKEND_URL + editCar.gambar}
                          alt="Preview"
                          style={{ maxWidth: 120, borderRadius: 8, border: "1px solid #ccc" }}
                        />
                      </div>
                    )}
                    <Form.Text>Upload foto mobil (jpg/png/webp).</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Transmisi</Form.Label>
                    <Form.Select name="transmisi" defaultValue={editCar?.transmisi || "Automatic"}>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Kapasitas</Form.Label>
                    <Form.Control name="kapasitas" type="number" min={1} max={20} defaultValue={editCar?.kapasitas || ""} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fitur (pisahkan dengan koma)</Form.Label>
                    <Form.Control name="fitur" defaultValue={Array.isArray(editCar?.fitur) ? editCar.fitur.join(", ") : ""} />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowFormModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Konfirmasi Hapus</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Apakah Anda yakin ingin menghapus mobil ini?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Batal</Button>
            <Button variant="danger" onClick={handleDelete}>Hapus</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CarsPage;