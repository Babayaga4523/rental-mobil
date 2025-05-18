const express = require('express');
const router = express.Router();
const Layanan = require('../controllers/layanan');
const upload = require('../middleware/upload'); // pastikan ada file upload.js (multer config)

router.get('/', Layanan.getAll);
router.get('/:id', Layanan.getById);
router.post('/', upload.single('gambar'), Layanan.create);
router.put('/:id', upload.single('gambar'), Layanan.update);
router.delete('/:id', Layanan.delete);

module.exports = router;
