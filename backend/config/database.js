const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("agoy2", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
