const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Testimoni = sequelize.define('Testimoni', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user', // Sesuaikan dengan nama tabel user Anda
      key: 'id'
    }
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pesan: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  tanggal: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'testimoni', // Nama tabel di database
  timestamps: true, // Aktifkan createdAt dan updatedAt
  createdAt: 'tanggal', // Gunakan kolom 'tanggal' sebagai createdAt
  updatedAt: false // Nonaktifkan updatedAt
});

module.exports = Testimoni;