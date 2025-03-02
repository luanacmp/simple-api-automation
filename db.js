const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

async function ensureUserTable() {
    const createUserTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
    const createMoviesTable = `
        CREATE TABLE IF NOT EXISTS movies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          rating VARCHAR(255) NOT NULL,
          genre VARCHAR(255) NOT NULL,
          userId INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;

    try {
        await pool.query(createUserTable);
        console.log("Users table checked/created successfully.");
    } catch (error) {
        console.error("Error checking/creating users table:", error.message);
    }

    try {
        await pool.query(createMoviesTable);
        console.log("Movies table checked/created successfully.");
    } catch (error) {
        console.error("Error checking/creating movies table:", error.message);
    }
}


module.exports = {
    pool,
    ensureUserTable,
};
