const LayananModel = require('../models/layanan');

// GET semua layanan
exports.getAll = async (req, res) => {
  try {
    const layanan = await LayananModel.findAll();
    res.json(layanan);
  } catch (err) {
    console.error('Error fetching layanan:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET layanan berdasarkan ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const layanan = await LayananModel.findByPk(id);
    
    if (!layanan) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }
    
    res.json(layanan);
  } catch (err) {
    console.error('Error fetching layanan by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST buat tambah layanan baru
exports.create = async (req, res) => {
  try {
    const layanan = await LayananModel.create(req.body);
    res.status(201).json(layanan);
  } catch (err) {
    console.error('Error creating layanan:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT untuk update kategori layanan
exports.updateKategori = async (req, res) => {
  try {
    const { id } = req.params;
    const { kategori } = req.body;

    const layanan = await LayananModel.findByPk(id);
    if (!layanan) {
      return res.status(404).json({ message: 'Layanan tidak ditemukan' });
    }

    layanan.kategori = kategori;
    await layanan.save();

    res.json({ message: 'Kategori berhasil diupdate', layanan });
  } catch (err) {
    console.error('Error updating kategori:', err);
    res.status(500).json({ error: err.message });
  }
};
