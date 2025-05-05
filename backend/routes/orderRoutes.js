// backend/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { check } = require('express-validator');

// Apply auth middleware to all order routes
router.use(authMiddleware);
router.post('/orders', authMiddleware, orderController.createOrder); // Verifikasi token sebelum membuat order

// Define routes
router.post(
  '/',
  [
    check('car_id', 'Car ID is required').not().isEmpty(),
    check('pickup_date', 'Pickup date is required').not().isEmpty(),
    check('return_date', 'Return date is required').not().isEmpty(),
    check('pickup_date').custom((value, { req }) => {
      if (new Date(value) < new Date()) {
        throw new Error('Pickup date cannot be in the past');
      }
      return true;
    }),
    check('return_date').custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.pickup_date)) {
        throw new Error('Return date must be after pickup date');
      }
      return true;
    })
  ],
  orderController.createOrder
);

router.get('/', orderController.getAllOrders);

router.get('/:id', 
  [
    check('id', 'Invalid order ID').isInt()
  ],
  orderController.getOrderById
);

module.exports = router;