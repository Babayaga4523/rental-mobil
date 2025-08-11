import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Spinner,
  Row,
  Col,
  Card,
  Container,
  ProgressBar,
  InputGroup
} from "react-bootstrap";
import { 
  FaStar, 
  FaReply, 
  FaCommentDots, 
  FaEdit, 
  FaRegCheckCircle,
  FaRegClock,
  FaSearch,
  FaUser,
  FaCar
} from "react-icons/fa";
import { toast as toastify } from "react-toastify";
import { API_URL } from "../utils/api";

const TestimoniReplyPage = () => {
  const [testimoni, setTestimoni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, replied: 0, pending: 0 });

  const token = localStorage.getItem("token");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_URL}/testimoni?status=approved`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data.data || res.data;
        setTestimoni(data);
        setStats({
          total: data.length,
          replied: data.filter(t => t.reply).length,
          pending: data.filter(t => !t.reply).length
        });
      })
      .catch(() => setTestimoni([]))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredTestimoni = testimoni.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.layanan_nama && item.layanan_nama.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleShowReply = (item) => {
    setSelected(item);
    setReply(item.reply || "");
  };

  const handleCloseReply = () => {
    setSelected(null);
    setReply("");
  };

  const showNotification = (message, variant = "success") => {
    if (variant === "success") {
      toastify.success(message, {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
        icon: "✅"
      });
    } else if (variant === "danger") {
      toastify.error(message, {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
        icon: "❌"
      });
    } else {
      toastify.info(message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
        icon: "ℹ️"
      });
    }
  };

  const handleSaveReply = async () => {
    if (!reply.trim()) {
      showNotification("Balasan tidak boleh kosong.", "danger");
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/testimoni/${selected.id}/reply`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestimoni((t) =>
        t.map((item) => {
          if (item.id === selected.id) {
            const updatedItem = { ...item, reply };
            setStats(prev => ({
              ...prev,
              replied: updatedItem.reply ? prev.replied + 1 : prev.replied - 1,
              pending: !updatedItem.reply ? prev.pending + 1 : prev.pending - 1
            }));
            return updatedItem;
          }
          return item;
        })
      );
      showNotification("Balasan berhasil disimpan.", "success");
      handleCloseReply();
    } catch {
      showNotification("Gagal menyimpan balasan.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const RatingStars = ({ rating }) => (
    <div className="d-flex rating-stars-futuristic">
      {[...Array(5)].map((_, i) => (
        <FaStar 
          key={i} 
          className={i < rating ? "text-warning" : "text-secondary"} 
        />
      ))}
    </div>
  );

  return (
    <Container fluid className="px-4 py-4">
      {/* Header and Stats */}
      <Row className="mb-4 g-4">
        <Col md={8}>
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
              <FaCommentDots className="text-primary fs-3" />
            </div>
            <div>
              <h2 className="fw-bold mb-0">Manajemen Testimoni</h2>
              <p className="text-muted mb-0">Kelola balasan testimoni pelanggan</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4 g-4">
        <Col xl={4} lg={6} md={6}>
          <Card className="stat-card-futuristic h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-futuristic info">
                  <FaCommentDots className="fs-2 text-white" />
                </div>
                <div>
                  <div className="text-muted small mb-1">Total Testimoni</div>
                  <div className="fw-bold fs-3">{stats.total}</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} lg={6} md={6}>
          <Card className="stat-card-futuristic h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-futuristic success">
                  <FaRegCheckCircle className="fs-2 text-white" />
                </div>
                <div>
                  <div className="text-muted small mb-1">Sudah Dibalas</div>
                  <div className="fw-bold fs-3">{stats.replied}</div>
                  <ProgressBar 
                    now={(stats.replied / stats.total) * 100} 
                    variant="success" 
                    className="mt-2" 
                    style={{ height: '4px' }} 
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={4} lg={6} md={6}>
          <Card className="stat-card-futuristic h-100">
            <Card.Body>
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-futuristic warning">
                  <FaRegClock className="fs-2 text-white" />
                </div>
                <div>
                  <div className="text-muted small mb-1">Belum Dibalas</div>
                  <div className="fw-bold fs-3">{stats.pending}</div>
                  <ProgressBar 
                    now={(stats.pending / stats.total) * 100} 
                    variant="warning" 
                    className="mt-2" 
                    style={{ height: '4px' }} 
                  />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search and Table */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-0">
          <div className="p-3 border-bottom">
            <Row className="align-items-center">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text className="bg-transparent border-end-0">
                    <FaSearch className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Cari testimoni..."
                    className="border-start-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6} className="text-md-end mt-2 mt-md-0">
                <Badge bg="info" className="fs-6 px-3 py-2">
                  {filteredTestimoni.length} Hasil
                </Badge>
              </Col>
            </Row>
          </div>
          
          <div className="table-responsive">
            <Table hover className="mb-0 table-futuristic">
              <thead className="table-light">
                <tr>
                  <th>Pelanggan</th>
                  <th>Layanan</th>
                  <th>Testimoni</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="text-end">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : filteredTestimoni.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      Tidak ada testimoni yang ditemukan
                    </td>
                  </tr>
                ) : (
                  filteredTestimoni.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="user-avatar-futuristic me-2">
                            <FaUser />
                          </div>
                          <span className="fw-semibold">{item.nama}</span>
                        </div>
                      </td>
                      <td>
                        <Badge className="badge-soft">{item.layanan_nama || item.layanan_id || "-"}</Badge>
                      </td>
                      <td style={{ maxWidth: '300px' }} className="text-truncate">
                        {item.pesan}
                      </td>
                      <td>
                        <RatingStars rating={item.rating} />
                      </td>
                      <td>
                        {item.reply ? (
                          <Badge bg="success" className="px-3 py-2 rounded-pill">
                            <FaRegCheckCircle className="me-1" /> Terbalas
                          </Badge>
                        ) : (
                          <Badge bg="warning" className="px-3 py-2 rounded-pill">
                            <FaRegClock className="me-1" /> Pending
                          </Badge>
                        )}
                      </td>
                      <td className="text-end">
                        <Button
                          variant={item.reply ? "outline-primary" : "primary"}
                          size="sm"
                          onClick={() => handleShowReply(item)}
                          className="d-flex align-items-center btn-futuristic"
                        >
                          {item.reply ? <FaEdit className="me-1" /> : <FaReply className="me-1" />}
                          {item.reply ? "Edit" : "Balas"}
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

      {/* Reply Modal */}
      <Modal show={!!selected} onHide={handleCloseReply} centered size="lg" className="modal-futuristic">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            <FaReply className="me-2 text-primary" />
            Balas Testimoni
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <Row>

<Col md={6}>
  <div className="d-flex align-items-center mb-3">
    <div className="user-avatar-futuristic me-2">
      <FaUser />
    </div>
    <div>
      <h6 className="mb-0 fw-bold">{selected?.nama}</h6>
      <small className="text-muted">Pelanggan</small>
    </div>
  </div>
</Col>
              <Col md={6}>
                <div className="d-flex align-items-center mb-3">
    <div className="user-avatar-futuristic me-2">
                    <FaCar className="text-info" />
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">{selected?.layanan_nama || selected?.layanan_id || "-"}</h6>
                    <small className="text-muted">Layanan</small>
                  </div>
                </div>
              </Col>
            </Row>
            
            <Card className="border-0 bg-light mb-3">
              <Card.Body>
                <h6 className="fw-bold mb-2">Testimoni:</h6>
                <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{selected?.pesan}</p>
              </Card.Body>
            </Card>
            
            <div className="mb-3">
              <h6 className="fw-bold mb-2">Rating:</h6>
              <RatingStars rating={selected?.rating} />
            </div>
            
            <Form.Group>
              <Form.Label className="fw-bold">Balasan Anda</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Tulis balasan yang profesional dan ramah..."
                className="border-2"
                style={{ minHeight: '120px' }}
              />
            </Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={handleCloseReply}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSaveReply} disabled={saving}>
            {saving ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Menyimpan...
              </>
            ) : (
              "Kirim Balasan"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
      {`
        .stat-card-futuristic {
          background: #f8fafd;
          border-radius: 1.25rem;
          transition: box-shadow 0.2s, transform 0.2s;
          box-shadow: 0 2px 12px rgba(78,115,223,0.07);
          border: none;
          position: relative;
          overflow: hidden;
        }
        .stat-card-futuristic:hover {
          box-shadow: 0 8px 32px rgba(78,115,223,0.16);
          transform: translateY(-2px) scale(1.02);
        }
        .stat-icon-futuristic {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4e73df 0%, #224abe 100%);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          font-size: 2rem;
        }
        .stat-icon-futuristic.success {
          background: linear-gradient(135deg, #1cc88a 0%, #13855c 100%);
        }
        .stat-icon-futuristic.warning {
          background: linear-gradient(135deg, #f6c23e 0%, #dda20a 100%);
        }
        .stat-icon-futuristic.info {
          background: linear-gradient(135deg, #36b9cc 0%, #117a8b 100%);
        }
        .badge-soft {
          background: #f4f6fa !important;
          color: #495057 !important;
          font-weight: 500;
          border-radius: 1rem;
          font-size: 0.95rem;
          padding: 0.5em 1em;
        }
        .table-futuristic thead {
          background: #f8fafd;
          border-bottom: 2px solid #e9ecef;
        }
        .table-futuristic tbody tr {
          transition: background 0.15s;
        }
        .table-futuristic tbody tr:hover {
          background: #f4f8ff;
        }
        .btn-futuristic {
          border-radius: 1.5rem !important;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          box-shadow: 0 1px 4px rgba(78,115,223,0.07);
        }
        .modal-futuristic .modal-content {
          border-radius: 1.25rem;
          border: none;
          box-shadow: 0 8px 32px rgba(78,115,223,0.13);
        }
        .modal-futuristic .modal-header {
          border-bottom: none;
        }
        .modal-futuristic .modal-footer {
          border-top: none;
        }
        .rating-stars-futuristic svg {
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.06));
          margin-right: 2px;
        }
        .user-avatar-futuristic {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4e73df 0%, #36b9cc 100%);
          color: #fff;
          font-size: 1.25rem;
          box-shadow: 0 2px 8px rgba(78,115,223,0.10);
          border: 2px solid #fff;
        }
      `}
      </style>
    </Container>
  );
};

export default TestimoniReplyPage;