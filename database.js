require('dotenv').config();

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
  }
);

sequelize.authenticate()
  .then(function() {
    console.log("Conectado ao banco de dados 🚀");
  })
  .catch(function(err) {
    console.log("Erro na conexão: " + err);
  });

module.exports = {
  Sequelize: Sequelize,
  sequelize: sequelize,
}