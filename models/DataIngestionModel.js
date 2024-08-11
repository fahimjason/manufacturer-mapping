const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const {
    runQuery, 
    prepareStatement,
    runStatement,
    finalizeStatement,
    getFirstRow,
    getAllRows,
    getDB
} = require('../config/db');

class DataIngestionModel {
    constructor(dbPath) {
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        this.dbPath = dbPath;
    }

    async ingestData(productsCsvPath, matchesCsvPath) {
        const products = await this.readCsvFile(productsCsvPath);
        const matchTable = await this.readCsvFile(matchesCsvPath);

        console.log('Products CSV file successfully processed');
        console.log('Match table CSV file successfully processed');

        console.log('Sample product data:', products.slice(0, 3));
        console.log('Sample match data:', matchTable.slice(0, 3));

        await this.storeDataInDatabase(products, matchTable);

        return {
            productsCount: products.length,
            matchesCount: matchTable.length
        };
    }

    readCsvFile(filename) {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filename)
                .pipe(csv({ separator: ';' }))
                .on('data', (data) => {
                    Object.keys(data).forEach(key => {
                        if (data[key] === '') {
                            data[key] = null;
                        }
                    });
                    results.push(data);
                })
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
    }

    async storeDataInDatabase(products, matchTable) {
        const db = new sqlite3.Database(this.dbPath);
        let transactionActive = false;

        try {
            // await this.runQuery(db, "BEGIN TRANSACTION");
            await runQuery(db, "BEGIN TRANSACTION");
            transactionActive = true;

            const productColumns = Object.keys(products[0]).filter(col => col !== 'id');
            const matchColumns = Object.keys(matchTable[0]).filter(col => col !== 'id');

            const escapedProductColumns = productColumns.map(col => `"${col}"`);
            const escapedMatchColumns = matchColumns.map(col => `"${col}"`);

            // await this.runQuery(db, `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, ${escapedProductColumns.map(col => `${col} TEXT`).join(', ')})`);
            // await this.runQuery(db, `CREATE TABLE IF NOT EXISTS match_table (rowid INTEGER PRIMARY KEY AUTOINCREMENT, ${escapedMatchColumns.map(col => `${col} TEXT`).join(', ')})`);
            await runQuery(db, `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, ${escapedProductColumns.map(col => `${col} TEXT`).join(', ')})`);
            await runQuery(db, `CREATE TABLE IF NOT EXISTS match_table (rowid INTEGER PRIMARY KEY AUTOINCREMENT, ${escapedMatchColumns.map(col => `${col} TEXT`).join(', ')})`);

            // const insertProduct = await this.prepareStatement(db, `INSERT INTO products (${escapedProductColumns.join(', ')}) VALUES (${productColumns.map(() => '?').join(', ')})`);
            const insertProduct = await prepareStatement(db, `INSERT INTO products (${escapedProductColumns.join(', ')}) VALUES (${productColumns.map(() => '?').join(', ')})`);
            for (const product of products) {
                const values = productColumns.map(col => product[col]);
                // await this.runStatement(insertProduct, values);
                await runStatement(insertProduct, values);
            }
            // await this.finalizeStatement(insertProduct);
            await finalizeStatement(insertProduct);

            // const insertMatch = await this.prepareStatement(db, `INSERT INTO match_table (${escapedMatchColumns.join(', ')}) VALUES (${matchColumns.map(() => '?').join(', ')})`);
            const insertMatch = await prepareStatement(db, `INSERT INTO match_table (${escapedMatchColumns.join(', ')}) VALUES (${matchColumns.map(() => '?').join(', ')})`);
            for (const match of matchTable) {
                const values = matchColumns.map(col => match[col]);
                // await this.runStatement(insertMatch, values);
                await runStatement(insertMatch, values);
            }
            // await this.finalizeStatement(insertMatch);
            await finalizeStatement(insertMatch);

            // await this.runQuery(db, "COMMIT");
            await runQuery(db, "COMMIT");
            transactionActive = false;

            // const { count: productCount } = await this.getFirstRow(db, "SELECT COUNT(*) AS count FROM products");
            // const { count: matchCount } = await this.getFirstRow(db, "SELECT COUNT(*) AS count FROM match_table");
            const { count: productCount } = await getFirstRow(db, "SELECT COUNT(*) AS count FROM products");
            const { count: matchCount } = await getFirstRow(db, "SELECT COUNT(*) AS count FROM match_table");
            console.log(`Inserted ${productCount} products and ${matchCount} matches into the database`);

            // const sampleProducts = await this.getAllRows(db, "SELECT * FROM products LIMIT 3");
            // const sampleMatches = await this.getAllRows(db, "SELECT * FROM match_table LIMIT 3");
            const sampleProducts = await getAllRows(db, "SELECT * FROM products LIMIT 3");
            const sampleMatches = await getAllRows(db, "SELECT * FROM match_table LIMIT 3");
            console.log('Sample inserted products:', sampleProducts);
            console.log('Sample inserted matches:', sampleMatches);

        } catch (error) {
            if (transactionActive) {
                // await this.runQuery(db, "ROLLBACK");
                await runQuery(db, "ROLLBACK");
            }
            throw error;
        } finally {
            await new Promise((resolve, reject) => {
                db.close((err) => {
                    if (err) {
                        console.error(`Error closing database: ${err.message}`);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
    }

    // runQuery(db, sql, params = []) {
    //     return new Promise((resolve, reject) => {
    //         db.run(sql, params, function (err) {
    //             if (err) reject(err);
    //             else resolve(this);
    //         });
    //     });
    // }

    // prepareStatement(db, sql) {
    //     return new Promise((resolve, reject) => {
    //         const stmt = db.prepare(sql, (err) => {
    //             if (err) reject(err);
    //             else resolve(stmt);
    //         });
    //     });
    // }

    // runStatement(stmt, params) {
    //     return new Promise((resolve, reject) => {
    //         stmt.run(params, function (err) {
    //             if (err) reject(err);
    //             else resolve(this);
    //         });
    //     });
    // }

    // finalizeStatement(stmt) {
    //     return new Promise((resolve, reject) => {
    //         stmt.finalize((err) => {
    //             if (err) reject(err);
    //             else resolve();
    //         });
    //     });
    // }

    // getFirstRow(db, sql, params = []) {
    //     return new Promise((resolve, reject) => {
    //         db.get(sql, params, (err, row) => {
    //             if (err) reject(err);
    //             else resolve(row);
    //         });
    //     });
    // }

    // getAllRows(db, sql, params = []) {
    //     return new Promise((resolve, reject) => {
    //         db.all(sql, params, (err, rows) => {
    //             if (err) reject(err);
    //             else resolve(rows);
    //         });
    //     });
    // }
}

module.exports = DataIngestionModel;