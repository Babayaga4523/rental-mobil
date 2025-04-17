const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/register', (req, res) => {
  const { nama, email, no_telp, password } = req.body;
  const sql = 'INSERT INTO users (nama, email, no_telp, password) VALUES (?, ?, ?, ?)';
  db.query(sql, [nama, email, no_telp, password], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal register', error: err });
    res.json({ message: 'Register berhasil' });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
