const jwt = require('jsonwebtoken');
const { User } = require('../models/user'); // Sesuaikan dengan model User Anda

// Middleware untuk memverifikasi token
const authMiddleware = async (req, res, next) => {
  try {
    // Ambil token dari header Authorization
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan, otorisasi ditolak' });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

    // Cari user berdasarkan id yang ada pada token
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    }

    // Tambahkan user ke request object
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
};

module.exports = authMiddleware;
