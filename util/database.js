const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('expense_db', 'root', 'Sah123@##', {
    host: 'localhost',
    dialect: 'mysql'
});

// Test Connection
sequelize.authenticate()
    .then(() => console.log("Connected to MySQL via Sequelize"))
    .catch(err => console.error("Database connection failed:", err));

module.exports = sequelize;