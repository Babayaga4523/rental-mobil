const express = require('express');
const app = express();
const sequelize = require('./config/database');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/userRoute');
const carRoutes = require('./routes/carRoute');
const layananRoutes = require('./routes/layanan');
const testimoniRoutes = require('./routes/testimoni');

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/layanan', layananRoutes);
app.use('/api/testimoni', testimoniRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Rental Mobil API is running');
});

// Database connection and server start
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    // Sync models with database
    await sequelize.sync({ alter: true }); // Gunakan { force: true } hanya untuk development
    console.log('Database synced');
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Keluar dari proses jika database tidak terkoneksi
  }
})();