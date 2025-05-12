const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const { check } = require("express-validator");
const path = require('path');
const fs = require('fs'); // Tambahkan ini untuk mengatasi error 'fs is not defined'
require("dotenv").config();
const multer = require('multer');

// Multer setup for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '../uploads/payment_proofs');
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, or PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Apply auth middleware to all order routes
router.use(authMiddleware);

// Route to create order with optional payment proof
router.post(
  '/',
  upload.single('payment_proof'),
  [
    check('layanan_id', 'Car ID is required').isInt(),
    check('pickup_date', 'Valid pickup date is required').isISO8601(),
    check('return_date', 'Valid return date is required').isISO8601(),
    check('payment_method', 'Invalid payment method')
      .optional()
      .isIn(['credit_card', 'bank_transfer', 'e_wallet']),
    check('total_price', 'Total price must be a number').optional().isFloat()
  ],
  orderController.createOrder
);

// Route to upload payment proof for existing order
router.put(
  '/:id/payment',
  upload.single('payment_proof'),
  [
    check('id', 'Invalid order ID').isInt()
  ],
  orderController.uploadPaymentProof
);

// Route to get all orders with optional filtering
router.get(
  "/",
  [
    check('page', 'Page must be a positive integer').optional().isInt({ min: 1 }),
    check('limit', 'Limit must be a positive integer').optional().isInt({ min: 1 }),
    check('status', 'Invalid status').optional().isIn([
      'unpaid', 'pending', 'confirmed', 'completed', 'cancelled'
    ])
  ],
  orderController.getAllOrders
);

// Route to get order by id
router.get(
  "/:id",
  [
    check("id", "Invalid order ID").isInt()
  ],
  orderController.getOrderById
);

// Route to verify payment (admin only)
router.put(
  '/:id/verify',
  [
    check('id', 'Invalid order ID').isInt(),
    check('status', 'Invalid verification status').isIn(['paid', 'rejected'])
  ],
  orderController.verifyPayment
);

// Route to cancel order
router.put(
  '/:id/cancel',
  [
    check('id', 'Invalid order ID').isInt()
  ],
  orderController.cancelOrder
);

// Route to get order receipt
router.get(
  '/:id/receipt',
   authMiddleware, // Tambahkan middleware auth
  [
    check('id', 'Invalid order ID').isInt()
  ],
  orderController.getOrderByUserId
);

module.exports = router;