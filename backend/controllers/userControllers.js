const User = require('../models/User'); // Pastikan path sesuai struktur projek kamu
const bcrypt = require('bcryptjs');

// Fungsi untuk register user
const registerUser = async (req, res) => {
  try {
    const { nama, email, password, no_telp } = req.body;

    // Validasi
    if (!nama || !email || !password || !no_telp) {
      return res.status(400).json({ success: false, message: 'Semua field harus diisi.' });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user baru
    const newUser = await User.create({
      name: nama,
      email,
      password: hashedPassword,
      no_telp,
      role: "user" // default role
    });

    // Kirim response tanpa password
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi login (placeholder)
const loginUser = async (req, res) => {
  res.status(200).json({ message: "Login belum diimplementasikan." });
};

// Ambil semua user
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Jangan tampilkan password
    });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Ambil user berdasarkan ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nama, email, password, role, no_telp } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    user.name = nama || user.name;
    user.email = email || user.email;
    user.no_telp = no_telp || user.no_telp;
    user.role = role || user.role;

    // Jika password diubah, hash ulang
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toJSON();
    res.status(200).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Hapus user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: 'User berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Export semua fungsi
module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
