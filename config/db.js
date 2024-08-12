const sqlite3 = require('sqlite3').verbose();

const runQuery = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        const callback = function (err) {
            if (err) {
                console.error('Error running query:', err);
                reject(err);
            } else {
                resolve(this);
            }
        };

        if (typeof sql === 'string') {
            db.run(sql, params, callback);
        } else {
            sql.run(params, callback);
        }
    });
}

const prepareStatement = (db, sql) => {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(sql, (err) => {
            if (err) reject(err);
            else resolve(stmt);
        });
    });
}

const runStatement = (stmt, params) => {
    return new Promise((resolve, reject) => {
        stmt.run(params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

const finalizeStatement = (stmt) => {
    return new Promise((resolve, reject) => {
        stmt.finalize((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

const getFirstRow = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

const getAllRows = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

const getDB = (dbPath) => {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            // console.log('Connected to the database.');
        }
    });
}

const closeDb = (db) => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
                reject(err);
            } else {
                // console.log('Database connection closed.');
                resolve();
            }
        });
    });
}

module.exports = {
    runQuery, 
    prepareStatement,
    runStatement,
    finalizeStatement,
    getFirstRow,
    getAllRows,
    getDB,
    closeDb
};
