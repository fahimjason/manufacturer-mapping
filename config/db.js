const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/manufacturers.db');
const db = new sqlite3.Database(dbPath);

// products-> title;manufacturer;source;source_id;country_code;barcode;composition;description
// matches-> id;m_source;c_source;m_country_code;c_country_code;m_source_id;c_source_id;validation_status

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS main_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        m_source TEXT,
        m_source_id TEXT,
        m_manufacturer TEXT,
        m_product TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS competitor_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        c_source TEXT,
        c_source_id TEXT,
        c_manufacturer TEXT,
        c_product TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS product_match (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        m_source TEXT,
        m_source_id TEXT,
        c_source TEXT,
        c_source_id TEXT
    )`);
});

module.exports = db;
