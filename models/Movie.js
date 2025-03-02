const { pool } = require('../db');

async function getMovies(id) {
    try {
        const query = 'SELECT * FROM movies WHERE userId = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows;
    } catch (error) {
        throw error;
    }
}

async function getMovieById(id, userId) {
    try {
        const query = 'SELECT * FROM movies WHERE id = ? AND userId = ?';
        const [rows] = await pool.execute(query, [id, userId]);
        return rows[0];
    } catch (error) {
        throw error;
    }
}

async function addMovie(title, rating, genre, id) {
    try {
        const query = `
          INSERT INTO movies (title, rating, genre, userId) 
          VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [title, rating, genre, id]);
        return result.insertId;
    } catch (error) {
        throw error;
    }
}

async function updateMovie(data, id) {
    try {
        const query = `
            UPDATE movies
            SET ${Object.keys(data).filter(key => data[key]).map(key => `${key} = ?`).join(', ')}
            WHERE id = ?
          `;
        const [result] = await pool.execute(query, [...Object.values(data).filter(item => item), id]);
        return result[0];
    } catch (error) {
        throw error;
    }
}

async function deleteMovie(id) {
    try {
        const query = `
          DELETE FROM movies WHERE id = ?;
        `;
        const [result] = await pool.execute(query, [id]);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getMovies,
    getMovieById,
    updateMovie,
    addMovie,
    deleteMovie
};
