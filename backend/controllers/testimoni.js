// controllers/testimoni.js
const Testimoni = require('../models/testimoni');

const testimoniController = {
  getAllTestimoni: async (req, res) => {
    try {
      const testimonials = await Testimoni.findAll();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addTestimoni: async (req, res) => {
    try {
      const newTestimoni = await Testimoni.create(req.body);
      res.status(201).json(newTestimoni);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteTestimoni: async (req, res) => {
    try {
      await Testimoni.destroy({ where: { id: req.params.id } });
      res.json({ message: 'Testimoni deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = testimoniController;