const Layanan = require('../models/layanan');

exports.getAll = async (req, res) => {
  try {
    const layanan = await Layanan.findAll();
    res.json({ success: true, data: layanan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const layanan = await Layanan.findByPk(req.params.id);
    if (!layanan) return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    res.json({ success: true, data: layanan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama, kategori, harga, status, deskripsi } = req.body;
    let gambar = null;
    if (req.file) {
      gambar = `/uploads/${req.file.filename}`;
    }
    if (!nama || !kategori || !harga) {
      return res.status(400).json({ message: "Nama, kategori, dan harga wajib diisi" });
    }
    const layanan = await Layanan.create({
      nama,
      kategori,
      harga,
      status: status || 'available',
      deskripsi: deskripsi || '',
      gambar
    });
    res.status(201).json({ success: true, data: layanan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const layanan = await Layanan.findByPk(req.params.id);
    if (!layanan) return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    const { nama, kategori, harga, status, deskripsi } = req.body;
    let gambar = layanan.gambar;
    if (req.file) {
      gambar = `/uploads/${req.file.filename}`;
    }
    await layanan.update({
      nama: nama ?? layanan.nama,
      kategori: kategori ?? layanan.kategori,
      harga: harga ?? layanan.harga,
      status: status ?? layanan.status,
      deskripsi: deskripsi ?? layanan.deskripsi,
      gambar
    });
    res.json({ success: true, data: layanan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const layanan = await Layanan.findByPk(req.params.id);
    if (!layanan) return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    await layanan.destroy();
    res.json({ success: true, message: "Layanan berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
