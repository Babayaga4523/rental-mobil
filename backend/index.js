const express = require('express');
const app = express();
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoute');
const carRoutes = require('./routes/carRoute');
const Layanan = require('./routes/layanan');
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/layanan', Layanan);
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
    await sequelize.sync();
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
