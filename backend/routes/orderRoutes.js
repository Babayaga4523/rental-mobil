// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const { check } = require("express-validator");
require("dotenv").config();

// Apply auth middleware to all order routes
router.use(authMiddleware);
router.post("/", authMiddleware, orderController.createOrder); // Verifikasi token sebelum membuat order

router.get("/", orderController.getAllOrders);

router.get(
  "/:id",
  [check("id", "Invalid order ID").isInt()],
  orderController.getOrderById
);

module.exports = router;
