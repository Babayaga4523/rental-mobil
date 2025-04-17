const mysql = require("mysql");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // ganti sesuai MySQL kamu
  database: "rental-mobil" // ganti sesuai nama database kamu
});

db.connect((err) => {
  if (err) {
    console.error("❌ Gagal konek ke database:", err);
  } else {
    console.log("✅ Terkoneksi ke database.");
  }
});

module.exports = db;
