const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', notificationController.getAll);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.post('/blast', notificationController.blast);
router.delete('/', notificationController.deleteAll); // Hapus semua notifikasi
router.delete('/:id', notificationController.deleteOne); // Hapus satu notifikasi

module.exports = router;