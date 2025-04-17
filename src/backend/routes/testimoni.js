const express = require("express");
const router = express.Router();
const db = require("../db");

// POST: Tambah testimoni
router.post("/", (req, res) => {
  const { nama, ulasan, rating } = req.body;

  if (!nama || !ulasan || !rating) {
    return res.status(400).json({ error: "Semua field harus diisi" });
  }

  const sql = "INSERT INTO testimoni (nama, ulasan, rating) VALUES (?, ?, ?)";
  db.query(sql, [nama, ulasan, rating], (err, result) => {
    if (err) {
      console.error("Gagal menambahkan testimoni:", err);
      return res.status(500).json({ error: "Gagal menambahkan testimoni" });
    }
    res.json({ message: "Testimoni berhasil ditambahkan", id: result.insertId });
  });
});

// GET: Semua testimoni
router.get("/", (req, res) => {
  db.query("SELECT * FROM testimoni ORDER BY tanggal DESC", (err, result) => {
    if (err) {
      console.error("Gagal mengambil testimoni:", err);
      return res.status(500).json({ error: "Gagal mengambil testimoni" });
    }
    res.json(result);
  });
});

module.exports = router;
