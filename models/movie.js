const { db } = require('../db');

function getMovies(userId) {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM movies WHERE userId = ?', [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getMovieById(id, userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM movies WHERE id = ? AND userId = ?', [id, userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function addMovie(title, rating, genre, userId) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO movies (title, rating, genre, userId) VALUES (?, ?, ?, ?)`;
        db.run(query, [title, rating, genre, userId], function (err) {
            if (err) reject(err);
            else resolve(this.lastID); // retorna o ID recém-inserido
        });
    });
}

function updateMovie(data, id) {
    return new Promise((resolve, reject) => {
        // ✅ Só permite atualizar campos válidos
        const allowedFields = ['title', 'rating', 'genre'];
        const keys = Object.keys(data).filter(key => allowedFields.includes(key));
        const values = keys.map(key => data[key]);

        if (keys.length === 0) return resolve(); // nada pra atualizar

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const query = `UPDATE movies SET ${setClause} WHERE id = ?`;

        db.run(query, [...values, id], function (err) {
            if (err) reject(err);
            else resolve(this.changes); // retorna quantas linhas foram alteradas
        });
    });
}


function deleteMovie(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM movies WHERE id = ?', [id], function (err) {
            if (err) reject(err);
            else resolve(this.changes); // retorna quantas linhas foram removidas
        });
    });
}

module.exports = {
    getMovies,
    getMovieById,
    addMovie,
    updateMovie,
    deleteMovie,
};
