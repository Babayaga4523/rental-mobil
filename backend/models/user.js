const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  no_telp:{
    type: DataTypes.STRING,
  },
  password:{
    type:DataTypes.STRING
  }
}, {
  tableName: 'users',
  timestamps: false,
});

module.exports = User;
