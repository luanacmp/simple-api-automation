const { db } = require('../db');

function createUser(name, email, password) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.run(query, [name, email, password], function (err) {
            if (err) return reject(err);
            resolve(this.lastID); // pega o ID do usuário recém-criado
        });
    });
}


function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        db.get(query, [email], (err, row) => {
            if (err) return reject(err);
            resolve(row); // retorna o usuário encontrado ou undefined
        });
    });
}


module.exports = {
    createUser,
    getUserByEmail,
};