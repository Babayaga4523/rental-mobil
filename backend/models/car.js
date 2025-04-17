const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Car = sequelize.define('Car', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  merek: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  harga_mobil:{
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'cars',
  timestamps: false,
});

module.exports = Car;