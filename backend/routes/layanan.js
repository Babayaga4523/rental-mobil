const express = require('express');
const router = express.Router();
const Layanan = require('../controllers/layanan');

// Route GET semua layanan
router.get('/', Layanan.getAll);

// Route GET layanan berdasarkan ID
router.get('/:id', Layanan.getById);

// Route POST buat tambah layanan baru
router.post('/', Layanan.create);

// ✅ Route PUT untuk update kategori
router.put('/:id/kategori', Layanan.updateKategori);

module.exports = router;
