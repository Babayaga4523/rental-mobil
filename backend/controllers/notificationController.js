const db = require('../models');
const Notification = db.Notification;

exports.getAll = async (req, res) => {
  try {
    // Untuk admin: tampilkan semua, untuk user: hanya miliknya
    const where = req.user.role === "admin" ? {} : { user_id: req.user.id };
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