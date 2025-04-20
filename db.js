const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize local SQLite database file in project directory
const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));

// Ensure the 'users' and 'movies' tables exist
function ensureUserTable() {
    const createUserTable = `
        CREATE TABLE IF NOT EXISTS users (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL,
                                             email TEXT NOT NULL UNIQUE,
                                             password TEXT NOT NULL,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const createMoviesTable = `
        CREATE TABLE IF NOT EXISTS movies (
                                              id INTEGER PRIMARY KEY AUTOINCREMENT,
                                              title TEXT NOT NULL,
                                              rating TEXT NOT NULL,
                                              genre TEXT NOT NULL,
                                              userId INTEGER NOT NULL,
                                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    db.serialize(() => {
        db.run(createUserTable, (err) => {
            if (err) {
                console.error("❌ Error creating 'users' table:", err.message);
            } else {
                console.log("✅ 'users' table verified.");
            }
        });

        db.run(createMoviesTable, (err) => {
            if (err) {
                console.error("❌ Error creating 'movies' table:", err.message);
            } else {
                console.log("✅ 'movies' table verified.");
            }
        });
    });
}

module.exports = {
    db,
    ensureUserTable,
};
