const Layanan = require('../models/layanan');


exports.getAll = async (req, res) => {
  try {
    const users = await Layanan.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const user = await Layanan.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};