const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const runQuery = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
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

const getDB = (dbName) => {
    const dbPath = path.resolve(__dirname, `../data/${dbName}.db`);
    const db = new sqlite3.Database(dbPath);

    return db;
}

module.exports = {
    runQuery, 
    prepareStatement,
    runStatement,
    finalizeStatement,
    getFirstRow,
    getAllRows,
    getDB
};
