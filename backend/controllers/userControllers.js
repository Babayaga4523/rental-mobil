require("dotenv").config();
const User = require("../models/user"); // Make sure to adjust if you are using a different ORM or model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Fungsi untuk register user
const registerUser = async (req, res) => {
  try {
    const { nama, email, password, no_telp } = req.body;

    // Validasi input
    if (!nama || !email || !password || !no_telp) {
      return res
        .status(400)
        .json({ success: false, message: "Semua field harus diisi." });
    }

    // Cek jika email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email sudah terdaftar." });
    }

    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database
    const newUser = await User.create({
      name: nama,
      email,
      password: hashedPassword,
      no_telp,
      role: "user", // Default role "user"
    });

    // Menghapus password sebelum mengirimkan data user
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

    // Validasi input
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email dan password harus diisi." });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah." });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah." });
    }

    // Membuat token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET, // Secret key (should be set in environment variable)
      { expiresIn: "1d" } // Token akan kadaluarsa dalam 1 hari
    );

    // Menghapus password sebelum mengirimkan data user
    const { password: _, ...userData } = user.toJSON();

    // Menyimpan token ke response dan mengirimkan data user
    res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server." });
  }
};

// Fungsi untuk menghapus user
const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    await user.destroy();
    res.status(200).json({ success: true, message: "User berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk mengambil semua users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // Jangan sertakan password dalam data yang dikirim
    });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk mengambil user berdasarkan ID
const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fungsi untuk update user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nama, email, no_telp } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan." });
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
  deleteUser,
};
