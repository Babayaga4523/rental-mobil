const express = require('express');
const router = express.Router();
const Layanan = require('../controllers/layanan');

router.get('/', Layanan.getAll);
router.post('/',Layanan.create);
module.exports = router