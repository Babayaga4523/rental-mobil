const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
require("dotenv").config(); // Sesuaikan path-nya

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.put("/:id/password", userController.changePassword); // Tambah ini
router.delete("/:id", userController.deleteUser);

module.exports = router;
