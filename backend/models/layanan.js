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
  harga: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gambar: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  kategori: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Umum', // bisa diatur default, misalnya 'Umum'
  },
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
