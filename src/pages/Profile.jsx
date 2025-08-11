import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle, FaEnvelope, FaPhoneAlt, FaCheckCircle, FaCamera, FaKey, FaBell, FaCarSide } from "react-icons/fa";
import "../style/Profil.css";
import { socket } from "../Admin/utils/socket";
import { toast } from "react-toastify";
import { API_URL } from "../utils/api";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    no_telp: "",
    photo: "",
  });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");
  const [orders, setOrders] = useState([]);
  const [notif, setNotif] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);

  // Ambil data user dari localStorage
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (userId && token) {
      axios
        .get(`${API_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data.user);
          setPhotoPreview(res.data.user.photo || "");
          setLoading(false);
        })
        .catch(() => setLoading(false));
      // Ambil riwayat pesanan
      axios
        .get(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setOrders(res.data.data || []));
    }
  }, [userId, token]);

  // Fetch notifikasi awal & polling
  const fetchNotif = async () => {
    setNotifLoading(true);
    const res = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotif(res.data || []);
    setNotifLoading(false);
  };

  useEffect(() => {
    fetchNotif();
    const interval = setInterval(fetchNotif, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Listener notifikasi baru dari socket.io
  useEffect(() => {
    socket.on("new_notification", notif => {
      setNotif(prev => [{ ...notif, id: Date.now(), read: false }, ...prev]);
      // Optional: tampilkan toast jika notif.user_id === user.id
    });
    return () => socket.off("new_notification");
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Ganti foto profil
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Submit edit profil
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    try {
      let photoUrl = user.photo;
      if (photoFile) {
        const formData = new FormData();
        formData.append("photo", photoFile);
        const uploadRes = await axios.post(
          `${API_URL}/users/${userId}/photo`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        photoUrl = uploadRes.data.photo;
        setPhotoPreview(photoUrl);
      }
      await axios.put(
        `${API_URL}/users/${userId}`,
        {
          nama: user.name,
          email: user.email,
          no_telp: user.no_telp,
          photo: photoUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Profil berhasil diperbarui!");
      localStorage.setItem("user", JSON.stringify({ ...user, name: user.name, photo: photoUrl }));
      toast.success("Profil berhasil diperbarui!", {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
        icon: "✅"
      });
    } catch (err) {
      setError("Gagal memperbarui profil.");
      toast.error("Gagal memperbarui profil.", {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
        icon: "❌"
      });
    }
  };

  // Ganti password
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess("");
    setPwError("");
    try {
      await axios.put(
        `${API_URL}/users/${userId}/password`,
        passwords,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwSuccess("Password berhasil diubah!");
      setPasswords({ oldPassword: "", newPassword: "" });
      toast.success("Password berhasil diubah!", {
        position: "top-right",
        autoClose: 2500,
        theme: "colored",
        icon: "✅"
      });
    } catch (err) {
      setPwError("Gagal mengubah password.");
      toast.error("Gagal mengubah password.", {
        position: "top-right",
        autoClose: 3500,
        theme: "colored",
        icon: "❌"
      });
    }
  };

  // Tambahkan di atas komponen Profile
  const markNotifAsRead = async (id, token) => {
    await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
  const markAllNotifAsRead = async (token) => {
    await axios.put(`${API_URL}/notifications/read-all`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
  const deleteNotif = async (id, token) => {
    await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
  const deleteAllNotif = async (token) => {
    await axios.delete(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };

  const handleMarkAsRead = async (id) => {
    await markNotifAsRead(id, token);
    fetchNotif();
  };
  const handleMarkAllAsRead = async () => {
    await markAllNotifAsRead(token);
    fetchNotif();
  };
  const handleDeleteNotif = async (id) => {
    await deleteNotif(id, token);
    fetchNotif();
  };
  const handleDeleteAllNotif = async () => {
    await deleteAllNotif(token);
    fetchNotif();
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );

  return (
    <div className="profil-container" style={{ paddingTop: 100 }}>
      <div className="row justify-content-center g-5">
        {/* Kartu Profil */}
        <div className="col-lg-5">
          <div className="profile-card bg-white shadow rounded-4 p-4 mb-4">
            <div className="text-center mb-4">
              <div className="position-relative d-inline-block">
                <img
                  src={
                    // Jika ada preview dari upload (blob), tampilkan langsung
                    photoPreview && photoPreview.startsWith("blob:")
                      ? photoPreview
                      // Jika preview dari backend ("/uploads/"), tambahkan BACKEND_URL
                      : photoPreview && photoPreview.startsWith("/uploads/")
                        ? `${API_URL.replace(/\/api$/, "")}${photoPreview}`
                        // Jika tidak ada preview, cek user.photo
                        : user.photo && user.photo.startsWith("/uploads/")
                          ? `${API_URL.replace(/\/api$/, "")}${user.photo}`
                          : user.photo || "/images/default-avatar.png"
                  }
                  alt="Foto Profil"
                  className="rounded-circle shadow"
                  style={{
                    width: 90,
                    height: 90,
                    objectFit: "cover",
                    border: "4px solid #e9ecef"
                  }}
                />
                <label
                  htmlFor="photoInput"
                  className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2"
                  style={{ cursor: "pointer", border: "2px solid #fff" }}
                  title="Ganti foto"
                >
                  <FaCamera />
                  <input
                    type="file"
                    id="photoInput"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <h2 className="fw-bold mb-1 text-gradient-primary mt-3">Edit Profil</h2>
              <div className="text-muted small mb-2">Kelola data akun Anda dengan mudah dan aman</div>
            </div>
            {success && (
              <div className="alert alert-success d-flex align-items-center gap-2 py-2">
                <FaCheckCircle className="me-2" /> {success}
              </div>
            )}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FaUserCircle className="me-2 text-primary" />
                  Nama
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-pill"
                  name="name"
                  value={user.name || ""}
                  onChange={handleChange}
                  required
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <FaEnvelope className="me-2 text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg rounded-pill"
                  name="email"
                  value={user.email || ""}
                  onChange={handleChange}
                  required
                  placeholder="Alamat email aktif"
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">
                  <FaPhoneAlt className="me-2 text-primary" />
                  No. Telepon
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-pill"
                  name="no_telp"
                  value={user.no_telp || ""}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill py-3">
                Simpan Perubahan
              </button>
            </form>
            <div className="text-center mt-3">
              <button
                className="btn btn-outline-secondary btn-sm rounded-pill"
                onClick={() => setShowPasswordForm((v) => !v)}
              >
                <FaKey className="me-2" />
                Ganti Password
              </button>
            </div>
            {showPasswordForm && (
              <form className="mt-3" onSubmit={handlePasswordSubmit}>
                {pwSuccess && <div className="alert alert-success py-2">{pwSuccess}</div>}
                {pwError && <div className="alert alert-danger py-2">{pwError}</div>}
                <div className="mb-2">
                  <input
                    type="password"
                    className="form-control rounded-pill"
                    name="oldPassword"
                    value={passwords.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Password lama"
                    required
                  />
                </div>
                <div className="mb-2">
                  <input
                    type="password"
                    className="form-control rounded-pill"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Password baru"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 rounded-pill">
                  Simpan Password
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Riwayat Pesanan & Notifikasi */}
        <div className="col-lg-7">
          {/* Riwayat Pesanan */}
          <div className="bg-white shadow rounded-4 p-4 mb-4">
            <h4 className="fw-bold mb-3 text-primary">
              <FaCarSide className="me-2" /> Riwayat Pesanan
            </h4>
            {orders.length === 0 ? (
              <div className="text-muted">Belum ada pesanan.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Mobil</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={order.id}>
                        <td>{idx + 1}</td>
                        <td>{order.car?.name || order.layanan?.nama || "-"}</td>
                        <td>
                          {order.pickup_date} s/d {order.return_date}
                        </td>
                        <td>
                          <span className={`badge bg-${order.status === "completed" ? "success" : order.status === "cancelled" ? "danger" : "warning"} text-capitalize`}>
                            {order.status}
                          </span>
                        </td>
                        <td>Rp {parseInt(order.total_price).toLocaleString("id-ID")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Notifikasi */}
          <div className="bg-white shadow rounded-4 p-4">
            <h4 className="fw-bold mb-3 text-primary">
              <FaBell className="me-2" /> Notifikasi
            </h4>
            <div className="mb-2 d-flex gap-2">
              <button className="btn btn-sm btn-outline-primary" onClick={handleMarkAllAsRead}>
                Tandai semua sudah dibaca
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={handleDeleteAllNotif}>
                Hapus semua
              </button>
            </div>
            {notifLoading ? (
              <div className="text-muted">Memuat notifikasi...</div>
            ) : notif.length === 0 ? (
              <div className="text-muted">Belum ada notifikasi.</div>
            ) : (
              <ul className="list-group list-group-flush">
                {notif.map((n, idx) => (
                  <li key={n.id || idx} className={`list-group-item d-flex align-items-center ${n.read ? "" : "fw-bold"}`}>
                    <span className="me-2">
                      <FaBell className={n.read ? "text-secondary" : "text-warning"} />
                    </span>
                    <span style={{ flex: 1 }}>{n.message}</span>
                    <span className="ms-2 small text-muted">{new Date(n.createdAt).toLocaleString("id-ID")}</span>
                    {!n.read && (
                      <button className="btn btn-sm btn-link text-success ms-2" onClick={() => handleMarkAsRead(n.id)}>
                        Tandai dibaca
                      </button>
                    )}
                    <button className="btn btn-sm btn-link text-danger ms-2" onClick={() => handleDeleteNotif(n.id)}>
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;