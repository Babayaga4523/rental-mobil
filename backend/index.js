const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import routes

const carRoutes = require('./routes/carRoute');
const layananRoutes = require('./routes/layanan');
const testimoniRoutes = require('./routes/testimoni');
const authRoutes = require('./routes/authRoute'); // tambahkan ini

// Gunakan route
;
app.use('/api/cars', carRoutes);
app.use('/api/layanan', layananRoutes);
app.use('/api/testimoni', testimoniRoutes);
app.use('/api/auth', authRoutes); // tambahkan ini juga

// Tes koneksi
app.get('/', (req, res) => {
  res.send('Rental Mobil API is running');
});

// Jalankan server dan koneksi database
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Sinkronisasi model
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    // Jalankan server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
})();
