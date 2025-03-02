const { pool } = require('../db');

async function createUser(name, email, password) {
    try {
        const query = `
          INSERT INTO users (name, email, password) 
          VALUES (?, ?, ?)
        `;
        const [result] = await pool.execute(query, [name, email, password]);
        return result.insertId;
    } catch (error) {
        throw error;
    }
}

async function getUserByEmail(email) {
    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.execute(query, [email]);
        return rows[0];
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createUser,
    getUserByEmail,
};
