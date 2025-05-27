import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Badge, Spinner, Alert } from "react-bootstrap";

const BACKEND_URL = "http://localhost:3000";

const TestimoniReplyPage = () => {
  const [testimoni, setTestimoni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "" });

  const token = localStorage.getItem("token");

  // Fetch hanya testimoni yang sudah di-approve
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BACKEND_URL}/api/testimoni?status=approved`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setTestimoni(res.data.data || res.data))
      .catch(() => setTestimoni([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleShowReply = (item) => {
    setSelected(item);
    setReply(item.reply || "");
  };

  const handleCloseReply = () => {
    setSelected(null);
    setReply("");
  };

  const handleSaveReply = async () => {
    if (!reply.trim()) {
      setAlert({ show: true, message: "Balasan tidak boleh kosong.", variant: "danger" });
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        `${BACKEND_URL}/api/testimoni/${selected.id}/reply`,
        { reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTestimoni(t =>
        t.map(item =>
          item.id === selected.id ? { ...item, reply } : item
        )
      );
      setAlert({ show: true, message: "Balasan berhasil disimpan.", variant: "success" });
      setTimeout(() => setAlert({ show: false, message: "", variant: "" }), 2000);
      handleCloseReply();
    } catch {
      setAlert({ show: true, message: "Gagal menyimpan balasan.", variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <h4 className="mb-4">Balas Testimoni Pelanggan</h4>
      {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}
      {loading ? (
        <div className="text-center py-5"><Spinner /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Mobil</th>
              <th>Pesan</th>
              <th>Rating</th>
              <th>Balasan Admin</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {testimoni.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted">Belum ada testimoni.</td>
              </tr>
            )}
            {testimoni.map(item => (
              <tr key={item.id}>
                <td>{item.nama}</td>
                <td>{item.layanan_nama || item.layanan_id || "-"}</td>
                <td>{item.pesan}</td>
                <td>
                  <Badge bg="warning" text="dark">{item.rating} <i className="bi bi-star-fill"></i></Badge>
                </td>
                <td>
                  {item.reply
                    ? <span className="text-success">{item.reply}</span>
                    : <span className="text-muted">Belum dibalas</span>
                  }
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => handleShowReply(item)}
                  >
                    Balas
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Balas */}
      <Modal show={!!selected} onHide={handleCloseReply} centered>
        <Modal.Header closeButton>
          <Modal.Title>Balas Testimoni</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2"><b>Nama:</b> {selected?.nama}</div>
          <div className="mb-2"><b>Pesan:</b> {selected?.pesan}</div>
          <Form.Group>
            <Form.Label>Balasan Admin</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Tulis balasan untuk pelanggan..."
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReply}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSaveReply} disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Kirim"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TestimoniReplyPage;