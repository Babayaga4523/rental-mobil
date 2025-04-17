const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt"); // Tambahkan bcrypt untuk hashing password

// 🔹 POST: Registrasi akun
router.post("/register", async (req, res) => {
  const { nama, email, no_telp, password } = req.body;

  // Validasi input
  if (!nama || !email || !no_telp || !password) {
    return res.status(400).json({ message: "Semua field harus diisi." });
  }

  // Validasi format email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Format email tidak valid." });
  }

  // Validasi panjang password
  if (password.length < 8) {
    return res.status(400).json({ message: "Password minimal 8 karakter." });
  }

  try {
    // Cek apakah email sudah terdaftar
    const checkEmailSql = "SELECT * FROM users WHERE email = ?";
    const [existingUser] = await db.query(checkEmailSql, [email]);
    
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email sudah digunakan." });
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru ke database
    const insertSql = "INSERT INTO users (nama, email, no_telp, password) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(insertSql, [nama, email, no_telp, hashedPassword]);

    res.status(201).json({ 
      message: "Registrasi berhasil!",
      user: {
        id: result.insertId,
        nama,
        email
      }
    });
  } catch (err) {
    console.error("❌ Error registrasi:", err);
    res.status(500).json({ message: "Gagal menyimpan data." });
  }
});

// 🔹 POST: Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

  try {
    const sql = "SELECT * FROM users WHERE email = ?";
    const [result] = await db.query(sql, [email]);

    if (result.length === 0) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const user = result[0];
    
    // Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Error login (DB):", err);
    res.status(500).json({ message: "Terjadi kesalahan saat login (server)." });
  }
});

module.exports = router;