require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const sequelize = require("./config/database");
const db = {};
const app = express();

// Buat folder uploads/payment_proofs jika belum ada
const uploadDir = path.join(__dirname, "uploads/payment_proofs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Folder uploads/payment_proofs dibuat.");
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const orderRoutes = require("./routes/orderRoutes");
const layananRoutes = require("./routes/layanan");
const testimoniRoutes = require("./routes/testimoni");
const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoute");
const notificationRoutes = require('./routes/notificationRoutes');

// Gunakan route
app.use("/api/layanan", layananRoutes);
app.use("/api/testimoni", testimoniRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use('/api/notifications', notificationRoutes);

// Tes koneksi
app.get("/", (req, res) => {
  res.send("Rental Mobil API is running");
});

// Jalankan server dan koneksi database
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Sinkronisasi model
    await sequelize.sync({ alter: true });
    console.log("Database synced");

    // Jalankan server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
})();
