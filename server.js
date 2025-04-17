// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
require('./src/backend/db');

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("./src/backend/routes/auth");
const layananRoutes = require("./src/backend/routes/layanan");
const testimoniRoutes = require("./src/backend/routes/testimoni");

// Gunakan route
app.use("/api/auth", authRoutes);
app.use("/api/layanan", layananRoutes);
app.use("/api/testimoni", testimoniRoutes);

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
