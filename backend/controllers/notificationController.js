const db = require('../models');
const Notification = db.Notification;
const User = db.User; // Pastikan model User sudah ada di db/index.js
const { sendMail } = require("../utils/email");
const { sendWA } = require("../utils/whatsapp"); // Jika ada

exports.getAll = async (req, res) => {
  try {
    // Untuk admin: tampilkan semua, untuk user: hanya miliknya
    const where = req.user.role === "admin" ? { type: "info" } : { user_id: req.user.id, type: "info" };
    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    notif.read = true;
    await notif.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { user_id: req.user.id };
    await Notification.update({ read: true }, { where });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.blast = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ success: false, message: "Pesan tidak boleh kosong" });
    }

    const users = await User.findAll({ where: { status: 'active' } });
    let successCount = 0, failCount = 0;

    for (const user of users) {
      try {
        // Kirim email
        if (user.email) {
          await sendMail({
            to: user.email,
            subject: "Notifikasi dari Admin",
            html: message
          });
        }
        // Kirim WhatsApp jika ada nomor dan fungsi
        if (user.no_telp && typeof sendWA === "function") {
          await sendWA(user.no_telp, message);
        }
        // Simpan notifikasi ke database
        await Notification.create({ user_id: user.id, message, type: "blast" });
        successCount++;
      } catch (err) {
        failCount++;
        console.error(`Gagal kirim ke ${user.email || user.no_telp}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Notifikasi dikirim ke ${successCount} user${failCount ? `, gagal ke ${failCount} user` : ""}.`
    });
  } catch (err) {
    console.error("Error blast notifikasi:", err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    // Jika admin, hapus semua notifikasi. Jika user, hanya notifikasi miliknya.
    const where = req.user.role === "admin" ? {} : { user_id: req.user.id };
    await Notification.destroy({ where });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    await notif.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};