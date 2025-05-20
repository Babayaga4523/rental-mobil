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
      model: 'user',
      key: 'id'
    }
  },
  layanan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'layanan',
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
  tableName: 'testimoni',
  timestamps: true,
  createdAt: 'tanggal',
  updatedAt: false
});

module.exports = Testimoni;