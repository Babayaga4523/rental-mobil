const User = require('../models/User'); // Pastikan path sesuai struktur projek kamu
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fungsi untuk register user
const registerUser = async (req, res) => {
  try {
    const { nama, email, password, no_telp } = req.body;

    if (!nama || !email || !password || !no_telp) {
      return res.status(400).json({ success: false, message: 'Semua field harus diisi.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: nama,
      email,
      password: hashedPassword,
      no_telp,
      role: "user"
    });

    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json({ success: true, user: userWithoutPassword });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password harus diisi.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    const { password: _, ...userData } = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
};

// Fungsi untuk menghapus user
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

// Tambahan fungsi opsional
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nama, email, no_telp } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    user.name = nama || user.name;
    user.email = email || user.email;
    user.no_telp = no_telp || user.no_telp;

    await user.save();

    const { password: _, ...updatedUser } = user.toJSON();

    res.status(200).json({ success: true, user: updatedUser });

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
