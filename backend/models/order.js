const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Sesuaikan dengan path config database Anda

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Nama model/tabel User
      key: 'id'
    }
  },
  car_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Layanan', // Nama model/tabel Layanan
      key: 'id'
    }
  },
  order_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  pickup_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'tanggal pengambilan mobil'
  },
  return_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'tanggal pengembalian mobil'
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'total harga sewa'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'status pesanan'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'metode pembayaran'
  },
  payment_status: {
    type: DataTypes.ENUM('unpaid', 'paid', 'failed'),
    allowNull: false,
    defaultValue: 'unpaid',
    comment: 'status pembayaran'
  },
  additional_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'catatan tambahan'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'waktu pembuatan'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW,
    comment: 'waktu terakhir diperbarui'
  }
}, {
  tableName: 'orders',
  timestamps: true, // Aktifkan createdAt dan updatedAt otomatis
  charset: 'utf8mb4',
  collate: 'utf8mb4_general_ci',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['car_id']
    }
  ]
});

module.exports = Order;