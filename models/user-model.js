const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Agent = sequelize.define("agent", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  
  email: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  password: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  
});

module.exports = Agent;
