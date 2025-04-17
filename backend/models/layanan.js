const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Layanan = sequelize.define('Layanan', {
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },
  harga:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gambar:{
    type: DataTypes.STRING,
    allowNull: false,
  },
}, 
{
  tableName: 'layanan',
  timestamps: false,
});

module.exports = Layanan;
