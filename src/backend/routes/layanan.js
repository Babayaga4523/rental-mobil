const express = require("express");
const router = express.Router();
const db = require("../db");

// GET: Detail layanan berdasarkan ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM layanan WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Database error", error: err });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Layanan tidak ditemukan" });
    }
    res.json(result[0]);
  });
});

module.exports = router;
