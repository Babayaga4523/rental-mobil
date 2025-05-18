const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Layanan = sequelize.define('Layanan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  harga: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gambar: {
    type: DataTypes.STRING,
    allowNull: true, // opsional
  },
  kategori: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Umum',
  },
  status: {
    type: DataTypes.ENUM('available', 'unavailable'),
    allowNull: false,
    defaultValue: 'available'
  }
}, 
{
  tableName: 'layanan',
  timestamps: false,
});

Layanan.associate = (models) => {
  Layanan.hasMany(models.Order, {
    foreignKey: 'layanan_id',
    as: 'orders'
  });
};
module.exports = Layanan;
