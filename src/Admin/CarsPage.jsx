import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table, Spinner, Alert, Badge, Dropdown, Button, Modal, Form,
  InputGroup, Toast, ToastContainer, Row, Col, Card, Pagination,
  ProgressBar, Accordion, ListGroup, Container
} from "react-bootstrap";
import {
  FaEllipsisV, FaEdit, FaTrash, FaPlus, FaSort, FaSortUp,
  FaSortDown, FaFileCsv, FaCar, FaSearch, FaInfoCircle, FaEye, FaStar, FaChartLine, FaCalendarAlt
} from "react-icons/fa";
import { CSVLink } from "react-csv";
import moment from "moment";
import { API_URL } from "../utils/api"; // GUNAKAN API_URL dari utils/api.js

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// Fungsi base url untuk gambar/file
const getBaseUrl = () => API_URL.replace(/\/api$/, "");

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
  const [filterSewaAktif, setFilterSewaAktif] = useState(false);
  const [stats, setStats] = useState({
    totalCars: 0,
    available: 0,
    rented: 0,
    topRated: null,
    mostRented: null
  });

  const token = localStorage.getItem("token");

  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/layanan`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const carsData = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      
      setCars(carsData);
      
      // Calculate stats
      const available = carsData.filter(c => c.status === 'available').length;
      const rented = carsData.filter(c => c.status === 'unavailable').length;
      const topRated = [...carsData].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
      const mostRented = [...carsData].sort((a, b) => 
        (orders.filter(o => o.layanan?.id === b.id).length) - 
        (orders.filter(o => o.layanan?.id === a.id).length)
      )[0];
      
      setStats({
        totalCars: carsData.length,
        available,
        rented,
        topRated,
        mostRented
      });
      
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

  useEffect(() => {
    fetchCars();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const showToast = (message, variant = "success") => {
    setToast({ show: false, message: "", variant }); // Reset dulu agar animasi muncul
    setTimeout(() => {
      setToast({ show: true, message, variant });
      if (window.__toastTimeout) clearTimeout(window.__toastTimeout);
      window.__toastTimeout = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
    }, 100);
  };

  const getSewaAktif = (carId) => {
    const now = moment();
    const aktif = orders.find(order =>
      order.layanan?.id === carId &&
      ["pending", "confirmed"].includes(order.status) &&
      moment(order.pickup_date).isSameOrBefore(now, "day") &&
      moment(order.return_date).isSameOrAfter(now, "day")
    );
    return aktif ? `${moment(aktif.pickup_date).format("DD/MM/YYYY")} - ${moment(aktif.return_date).format("DD/MM/YYYY")}` : "-";
  };

  const getDisewa = (carId) => orders.filter(order => order.layanan?.id === carId).length;

  const getDisewaHariIni = (carId) => {
    const today = moment().startOf('day');
    return orders.filter(order =>
      order.layanan?.id === carId &&
      ["pending", "confirmed"].includes(order.status) &&
      moment(order.pickup_date).startOf('day').isSameOrBefore(today) &&
      moment(order.return_date).startOf('day').isSameOrAfter(today)
    ).length;
  };

  const kategoriList = [...new Set(cars.map(car => car.kategori).filter(Boolean))];

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
    const matchSewaAktif = !filterSewaAktif || getSewaAktif(car.id) !== "-";
    return matchSearch && matchStatus && matchKategori && matchPromo && matchHarga && matchSewaAktif;
  });

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

  const csvHeaders = [
    { label: "ID", key: "id" },
    { label: "Nama Mobil", key: "nama" },
    { label: "Kategori", key: "kategori" },
    { label: "Harga", key: "harga" },
    { label: "Promo (%)", key: "promo" },
    { label: "Status", key: "status" },
    { label: "Disewa", key: "disewa" },
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
      disewa: getDisewa(car.id),
      rating: car.rating || "-"
    }));

  const handleShowDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleShowDetailModal = async (car) => {
    setDetailCar(car);
    setShowDetailModal(true);
  };

  const handleShowFormModal = (car = null) => {
    setEditCar(car);
    setFormImage(null);
    setShowFormModal(true);
  };

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData();

    data.append("nama", form.nama.value.trim());
    data.append("kategori", form.kategori.value.trim());
    data.append("harga", form.harga.value);
    data.append("status", form.status.value);
    data.append("deskripsi", form.deskripsi.value.trim());

    if (formImage) data.append("gambar", formImage);
    if (form.promo.value !== "" && !isNaN(Number(form.promo.value))) {
      data.append("promo", Number(form.promo.value));
    } else {
      data.append("promo", 0);
    }
    if (form.transmisi.value) data.append("transmisi", form.transmisi.value);
    if (form.kapasitas.value && Number(form.kapasitas.value) > 0) data.append("kapasitas", form.kapasitas.value);
    if (form.fitur.value) {
      data.append("fitur", form.fitur.value);
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

  const getRiwayatSewa = (carId) => {
    return orders
      .filter(order => order.layanan?.id === carId)
      .sort((a, b) => new Date(b.pickup_date) - new Date(a.pickup_date));
  };

  const StatusBadge = ({ status }) => {
    const variants = {
      available: { bg: "success", text: "Tersedia" },
      unavailable: { bg: "danger", text: "Tidak Tersedia" },
      pending: { bg: "warning", text: "Pending" },
      confirmed: { bg: "info", text: "Dikonfirmasi" },
      completed: { bg: "success", text: "Selesai" },
      cancelled: { bg: "secondary", text: "Dibatalkan" }
    };
    
    const { bg, text } = variants[status] || { bg: "secondary", text: status };
    return <Badge pill bg={bg}>{text}</Badge>;
  };

  return (
    <div className={darkMode ? "bg-dark text-light min-vh-100" : "bg-light min-vh-100"}>
      <Container fluid className="py-4 px-4">
        {/* Header */}
        <Row className="align-items-center mb-4">
          <Col xs={12} md={6}>
            <h2 className="mb-0 fw-bold text-gradient">
              <FaCar className="me-2" />
              Fleet Management Dashboard
            </h2>
            <p className="text-muted mb-0">Kelola armada kendaraan dengan mudah</p>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
            <Button 
              variant="primary" 
              onClick={() => handleShowFormModal()} 
              className="fw-bold rounded-pill px-4 shadow-sm"
            >
              <FaPlus className="me-2" />Tambah Mobil
            </Button>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4 g-4">
          <Col xs={12} md={6} lg={3}>
            <Card className={`neumorphism-card h-100`}>
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-2">Total Vehicles</h6>
                    <h3 className="mb-0">{stats.totalCars}</h3>
                    <ProgressBar 
                      now={100} 
                      variant="primary-gradient" 
                      className="mt-2" 
                      style={{ height: '6px', borderRadius: '3px' }}
                    />
                  </div>
                  <div className="icon-circle bg-primary-light">
                    <FaCar className="text-primary" size={20} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Card className="neumorphism-card h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-2">Available</h6>
                    <h3 className="mb-0">{stats.available}</h3>
                    <ProgressBar 
                      now={(stats.available / stats.totalCars) * 100} 
                      variant="success" 
                      className="mt-2" 
                      style={{ height: '6px', borderRadius: '3px' }}
                    />
                  </div>
                  <div className="icon-circle bg-success-light">
                    <FaCar className="text-success" size={20} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Card className="neumorphism-card h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-2">Rented</h6>
                    <h3 className="mb-0">{stats.rented}</h3>
                    <ProgressBar 
                      now={(stats.rented / stats.totalCars) * 100} 
                      variant="warning" 
                      className="mt-2" 
                      style={{ height: '6px', borderRadius: '3px' }}
                    />
                  </div>
                  <div className="icon-circle bg-warning-light">
                    <FaChartLine className="text-warning" size={20} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} lg={3}>
            <Card className="neumorphism-card h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-2">Top Rated</h6>
                    <h4 className="mb-0">
                      {stats.topRated ? (
                        <>
                          <span className="d-block text-truncate" style={{maxWidth: '120px'}}>
                            {stats.topRated.nama}
                          </span>
                          <div className="d-flex align-items-center">
                            <FaStar className="text-warning me-1" />
                            <span>{stats.topRated.rating || '-'}</span>
                          </div>
                        </>
                      ) : '-'}
                    </h4>
                  </div>
                  <div className="icon-circle bg-info-light">
                    <FaInfoCircle className="text-info" size={20} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filter & Export */}
        <Card className={`mb-4 shadow-sm border-0 ${darkMode ? "bg-dark-2" : "bg-white"}`}>
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col xs={12} md={4}>
                <InputGroup>
                  <InputGroup.Text className={darkMode ? "bg-dark border-dark" : ""}>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Cari nama/kategori/ID..."
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className={darkMode ? "bg-dark border-dark text-light" : ""}
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
                  className={darkMode ? "bg-dark border-dark text-light" : ""}
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
                  className={darkMode ? "bg-dark border-dark text-light" : ""}
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
                  className={darkMode ? "bg-dark border-dark text-light" : ""}
                >
                  <option value="all">Promo/Non Promo</option>
                  <option value="promo">Promo</option>
                  <option value="no_promo">Tanpa Promo</option>
                </Form.Select>
              </Col>
              
              <Col xs={6} md={2}>
                <Form.Control
                  type="number"
                  min={0}
                  placeholder="Min Harga"
                  value={filterHarga}
                  onChange={e => {
                    setFilterHarga(e.target.value);
                    setPage(1);
                  }}
                  className={darkMode ? "bg-dark border-dark text-light" : ""}
                />
              </Col>
              
              <Col xs={12} className="d-flex justify-content-between align-items-center">
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
                  className="btn btn-outline-success rounded-pill px-3"
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
          <Alert variant="info" className="rounded-3 shadow-sm border-0">
            <FaInfoCircle className="me-2" />
            Tidak ada data mobil yang sesuai dengan filter.
          </Alert>
        ) : (
          <div className="table-responsive rounded-4 shadow-sm">
            <Table
              hover
              className={`align-middle mb-0 ${darkMode ? "table-dark" : ""}`}
              style={{ minWidth: 1200 }}
            >
              <thead className={darkMode ? "bg-dark-2" : "bg-light"} style={{ position: "sticky", top: 0 }}>
                <tr>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("id")}>
                    <span className="d-flex align-items-center">
                      ID {getSortIcon("id")}
                    </span>
                  </th>
                  <th>Gambar</th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("nama")}>
                    <span className="d-flex align-items-center">
                      Nama Mobil {getSortIcon("nama")}
                    </span>
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("kategori")}>
                    <span className="d-flex align-items-center">
                      Kategori {getSortIcon("kategori")}
                    </span>
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("harga")}>
                    <span className="d-flex align-items-center">
                      Harga {getSortIcon("harga")}
                    </span>
                  </th>
                  <th>Promo</th>
                  <th>Status</th>
                  <th>Disewa</th>
                  <th>Rating</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedCars.map(car => (
                  <tr key={car.id} className={darkMode ? "hover-dark" : "hover-light"}>
                    <td>
                      <Badge bg="secondary" className="fw-bold rounded-pill px-3 py-2">
                        #{car.id}
                      </Badge>
                    </td>
                    <td>
                      <div 
                        className="rounded-3 overflow-hidden border" 
                        style={{ width: 80, height: 50 }}
                        onClick={() => handleShowDetailModal(car)}
                        role="button"
                      >
                        <img
                          src={car.gambar
                            ? car.gambar.startsWith("http") 
                              ? car.gambar 
                              : getBaseUrl() + car.gambar
                            : '/no-image.png'}
                          alt={car.nama}
                          className="img-fluid h-100 w-100 object-fit-cover"
                          onError={e => { e.target.onerror = null; e.target.src = '/no-image.png'; }}
                        />
                      </div>
                    </td>
                    <td className="fw-semibold">
                      <div className="d-flex flex-column">
                        <span>{car.nama}</span>
                        <small className="text-muted">{car.transmisi || '-'}, {car.kapasitas || '-'} seat</small>
                      </div>
                    </td>
                    <td>{car.kategori || '-'}</td>
                    <td>
                      <div className="d-flex flex-column">
                        {car.promo && car.promo > 0 ? (
                          <>
                            <span className="text-success fw-bold">
                              Rp {getHargaSetelahPromo(car).toLocaleString('id-ID')}
                            </span>
                            <small className="text-decoration-line-through text-muted">
                              Rp {car.harga?.toLocaleString('id-ID')}
                            </small>
                          </>
                        ) : (
                          <span className="fw-bold">
                            Rp {car.harga?.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {car.promo && car.promo > 0 ? (
                        <Badge bg="warning" text="dark" className="rounded-pill px-3 py-2">
                          {car.promo}% OFF
                        </Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={car.status} />
                      {getDisewaHariIni(car.id) > 0 && (
                        <div className="text-warning mt-1">
                          <small>Disewa: {getDisewaHariIni(car.id)}x</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge bg="info" className="rounded-pill px-3 py-2">
                        {getDisewa(car.id)}x
                      </Badge>
                    </td>
                    <td>
                      {car.rating ? (
                        <div className="d-flex align-items-center">
                          <span className="text-warning fw-bold me-1">{car.rating}</span>
                          <small className="text-muted">({car.jumlah_review || 0})</small>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-end">
                      <Dropdown>
                        <Dropdown.Toggle 
                          variant={darkMode ? "outline-light" : "outline-secondary"} 
                          size="sm" 
                          id="dropdown-actions"
                          className="rounded-pill px-3"
                        >
                          <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu className={darkMode ? "bg-dark-2" : ""}>
                          <Dropdown.Item 
                            onClick={() => handleShowDetailModal(car)}
                            className={darkMode ? "text-light hover-dark" : ""}
                          >
                            <FaEye className="me-2" /> Detail
                          </Dropdown.Item>
                          <Dropdown.Item 
                            onClick={() => handleShowFormModal(car)}
                            className={darkMode ? "text-light hover-dark" : ""}
                          >
                            <FaEdit className="me-2" /> Edit
                          </Dropdown.Item>
                          <Dropdown.Item 
                            className={`${darkMode ? "text-light hover-dark" : ""} text-danger`} 
                            onClick={() => handleShowDeleteModal(car.id)}
                          >
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
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Items per page:</span>
            <Form.Select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              style={{ width: 80 }}
              className={darkMode ? "bg-dark border-dark text-light" : ""}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </Form.Select>
            <span className="text-muted">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedCars.length)} of {sortedCars.length} items
            </span>
          </div>
          
          <Pagination className="mb-0">
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className={darkMode ? "bg-dark-2 text-light" : ""}
            />
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={page === idx + 1}
                onClick={() => setPage(idx + 1)}
                className={darkMode ? page === idx + 1 ? "" : "bg-dark-2 text-light" : ""}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={darkMode ? "bg-dark-2 text-light" : ""}
            />
          </Pagination>
        </div>

        {/* Detail Modal */}
        <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          centered
          size="lg"
          contentClassName={darkMode ? "bg-dark-2 text-light" : ""}
        >
          <Modal.Header closeButton className={darkMode ? "border-dark" : ""}>
            <Modal.Title className="fw-bold">
              <FaCar className="me-2" />
              Detail Mobil
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {detailCar && (
              <Row className="gy-4">
                <Col md={5} className="text-center">
                  <div className="position-relative">
                    <img
                      src={
                        detailCar.gambar
                          ? detailCar.gambar.startsWith("http")
                            ? detailCar.gambar
                            : getBaseUrl() + detailCar.gambar
                          : "/no-image.png"
                      }
                      alt={detailCar.nama}
                      className="img-fluid rounded-4 shadow-sm"
                      style={{
                        maxHeight: 220,
                        width: '100%',
                        objectFit: 'cover',
                        border: '1px solid #eee'
                      }}
                      onError={e => { e.target.onerror = null; e.target.src = "/no-image.png"; }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <StatusBadge status={detailCar.status} />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="fw-bold">#{detailCar.id}</h5>
                    <div className="d-flex justify-content-center gap-2 mt-2">
                      <Badge bg="secondary" className="px-3 py-2">
                        {detailCar.kategori || '-'}
                      </Badge>
                      {detailCar.transmisi && (
                        <Badge bg="info" className="px-3 py-2">
                          {detailCar.transmisi}
                        </Badge>
                      )}
                      {detailCar.kapasitas && (
                        <Badge bg="dark" className="px-3 py-2">
                          {detailCar.kapasitas} Seat
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="fw-bold">
                        {detailCar.promo && detailCar.promo > 0 ? (
                          <>
                            <span className="text-success">
                              Rp {getHargaSetelahPromo(detailCar).toLocaleString('id-ID')}
                            </span>
                            <div className="text-decoration-line-through text-muted fs-6">
                              Rp {detailCar.harga?.toLocaleString('id-ID')}
                            </div>
                          </>
                        ) : (
                          <span className="text-success">
                            Rp {detailCar.harga?.toLocaleString('id-ID')}
                          </span>
                        )}
                      </h4>
                      {detailCar.promo && detailCar.promo > 0 && (
                        <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">
                          Promo {detailCar.promo}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </Col>
                
                <Col md={7}>
                  <h3 className="fw-bold mb-3">{detailCar.nama}</h3>
                  
                  <div className="mb-4">
                    <h5 className="fw-bold mb-2">Fitur:</h5>
                    <div className="d-flex flex-wrap gap-2">
                      <FiturBadges fitur={detailCar.fitur} />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="fw-bold mb-2">Statistik:</h5>
                    <Row className="g-3">
                      <Col xs={6} md={4}>
                        <Card className={`h-100 ${darkMode ? "bg-dark border-dark" : ""}`}>
                          <Card.Body className="text-center py-3">
                            <div className="text-primary fw-bold fs-4">
                              {getDisewa(detailCar.id)}x
                            </div>
                            <small className="text-muted">Total Disewa</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={6} md={4}>
                        <Card className={`h-100 ${darkMode ? "bg-dark border-dark" : ""}`}>
                          <Card.Body className="text-center py-3">
                            <div className="text-warning fw-bold fs-4">
                              {getDisewaHariIni(detailCar.id)}x
                            </div>
                            <small className="text-muted">Sedang Disewa</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col xs={6} md={4}>
                        <Card className={`h-100 ${darkMode ? "bg-dark border-dark" : ""}`}>
                          <Card.Body className="text-center py-3">
                            <div className="d-flex align-items-center justify-content-center">
                              <FaStar className="text-warning me-1" />
                              <span className="fw-bold fs-4">
                                {detailCar.rating || '-'}
                              </span>
                            </div>
                            <small className="text-muted">Rating ({detailCar.jumlah_review || 0})</small>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="fw-bold mb-2">Deskripsi:</h5>
                    <p>{detailCar.deskripsi || '-'}</p>
                  </div>
                  
                  <Accordion defaultActiveKey="0" className={darkMode ? "bg-dark" : ""}>
                    <Accordion.Item eventKey="0" className={darkMode ? "bg-dark-2 text-light border-dark" : ""}>
                      <Accordion.Header className={darkMode ? "bg-dark-2" : ""}>
                        <h6 className="mb-0">Riwayat Sewa</h6>
                      </Accordion.Header>
                      <Accordion.Body>
                        {getRiwayatSewa(detailCar.id).length === 0 ? (
                          <div className="text-center py-3 text-muted">
                            Belum pernah disewa.
                          </div>
                        ) : (
                          <ListGroup variant="flush" className={darkMode ? "bg-dark-2" : ""}>
                            {getRiwayatSewa(detailCar.id).map((order, idx) => (
                              <ListGroup.Item key={order.id || idx} className={darkMode ? "bg-dark-2 text-light border-dark" : ""}>
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <div className="fw-bold">{order.user?.name || '-'}</div>
                                    <small className="text-muted d-flex align-items-center">
                                      <FaCalendarAlt className="me-1" />
                                      {moment(order.pickup_date).format("DD/MM/YYYY")} - {moment(order.return_date).format("DD/MM/YYYY")}
                                    </small>
                                  </div>
                                  <div>
                                    <StatusBadge status={order.status} />
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer className={darkMode ? "border-dark" : ""}>
            <Button 
              variant={darkMode ? "outline-light" : "outline-secondary"} 
              onClick={() => setShowDetailModal(false)}
            >
              Tutup
            </Button>
            <Button 
              variant="primary"
              onClick={() => {
                setShowDetailModal(false);
                handleShowFormModal(detailCar);
              }}
            >
              <FaEdit className="me-2" /> Edit
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add/Edit Modal */}
        <Modal 
          show={showFormModal} 
          onHide={() => setShowFormModal(false)} 
          centered
          size="lg"
          contentClassName={darkMode ? "bg-dark-2 text-light" : ""}
        >
          <Modal.Header closeButton className={darkMode ? "border-dark" : ""}>
            <Modal.Title>{editCar ? "Edit Mobil" : "Tambah Mobil Baru"}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFormSubmit} encType="multipart/form-data">
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nama Mobil</Form.Label>
                    <Form.Control 
                      name="nama" 
                      defaultValue={editCar?.nama || ""} 
                      required 
                      className={darkMode ? "bg-dark border-dark text-light" : ""}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Kategori</Form.Label>
                    <Form.Control 
                      name="kategori" 
                      defaultValue={editCar?.kategori || ""} 
                      required 
                      className={darkMode ? "bg-dark border-dark text-light" : ""}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Harga (Rp)</Form.Label>
                    <Form.Control 
                      name="harga" 
                      type="number" 
                      min={0} 
                      defaultValue={editCar?.harga || ""} 
                      required 
                      className={darkMode ? "bg-dark border-dark text-light" : ""}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select 
                      name="status" 
                      defaultValue={editCar?.status || "available"}
                      className={darkMode ? "bg-dark border-dark text-light" : ""}
                    >
                      <option value="available">Tersedia</option>
                      <option value="unavailable">Tidak Tersedia</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Promo (%)</Form.Label>
                    <Form.Control 
                      name="promo" 
                      type="number" 
                      min={0} 
                      max={100} 
                      defaultValue={editCar?.promo || ""}
                      className={darkMode ? "bg-dark border-dark text-light" : ""}
                    />
                    <Form.Text className="text-muted">
                      Kosongkan atau isi 0 jika tidak ada promo
                    </Form.Text>
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
                      className={darkMode ? "bg-dark border-dark text-light" : ""}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Foto Mobil</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={e => setFormImage(e.target.files[0])}
                      className={darkMode ? "bg-dark border-dark text-light" : ""}
                    />
                    {editCar?.gambar && !formImage && (
                      <div className="mt-2">
                        <img
                          src={editCar.gambar.startsWith("http") ? editCar.gambar : getBaseUrl() + editCar.gambar}
                          alt="Preview"
                          style={{ 
                            maxWidth: 150, 
                            borderRadius: 8, 
                            border: "1px solid #ccc",
                            aspectRatio: "16/9",
                            objectFit: "cover"
                          }}
                        />
                      </div>
                    )}
                    {formImage && (
                      <div className="mt-2">
                        <img
                          src={URL.createObjectURL(formImage)}
                          alt="Preview"
                          style={{ 
                            maxWidth: 150, 
                            borderRadius: 8, 
                            border: "1px solid #ccc",
                            aspectRatio: "16/9",
                            objectFit: "cover"
                          }}
                        />
                      </div>
                    )}
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Transmisi</Form.Label>
                        <Form.Select 
                          name="transmisi" 
                          defaultValue={editCar?.transmisi || "Automatic"}
                          className={darkMode ? "bg-dark border-dark text-light" : ""}
                        >
                          <option value="Automatic">Automatic</option>
                          <option value="Manual">Manual</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Kapasitas (Seat)</Form.Label>
                        <Form.Control 
                          name="kapasitas" 
                          type="number" 
                          min={1} 
                          max={20} 
                          defaultValue={editCar?.kapasitas || ""}
                          className={darkMode ? "bg-dark border-dark text-light" : ""}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Fitur (pisahkan dengan koma)</Form.Label>
                    <Form.Control 
                      name="fitur" 
                      defaultValue={Array.isArray(editCar?.fitur) ? editCar.fitur.join(", ") : editCar?.fitur || ""}
                      className={darkMode ? "bg-dark border-dark text-light" : ""}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className={darkMode ? "border-dark" : ""}>
              <Button 
                variant={darkMode ? "outline-light" : "outline-secondary"} 
                onClick={() => setShowFormModal(false)}
              >
                Batal
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="px-4"
              >
                {editCar ? "Update Mobil" : "Simpan Mobil"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <Modal 
          show={showDeleteModal} 
          onHide={() => setShowDeleteModal(false)} 
          centered
          contentClassName={darkMode ? "bg-dark-2 text-light" : ""}
        >
          <Modal.Header closeButton className={darkMode ? "border-dark" : ""}>
            <Modal.Title>Konfirmasi Hapus</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center py-3">
              <FaTrash size={48} className="text-danger mb-3" />
              <h5>Apakah Anda yakin ingin menghapus mobil ini?</h5>
              <p className="text-muted">Data yang sudah dihapus tidak dapat dikembalikan.</p>
            </div>
          </Modal.Body>
          <Modal.Footer className={darkMode ? "border-dark" : ""}>
            <Button 
              variant={darkMode ? "outline-light" : "outline-secondary"} 
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              className="px-4"
            >
              Ya, Hapus
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
                <FaInfoCircle className="me-2 flex-shrink-0" />
              ) : (
                <FaInfoCircle className="me-2 flex-shrink-0" />
              )}
              <span className="flex-grow-1">{toast.message}</span>
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </div>
  );
};

export default CarsPage;