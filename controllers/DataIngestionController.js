const csv = require('csv-parser');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const path = require('path');
const dbPath = path.resolve(__dirname, '../data/manufacturers.db');

class DataIngestionController {
    static async ingestData(req, res) {
        try {
            const products = await DataIngestionController.readCsvFile('data/apo-lt-data.csv');
            const matchTable = await DataIngestionController.readCsvFile('data/matches.csv');

            console.log('Products CSV file successfully processed');
            console.log('Match table CSV file successfully processed');

            console.log('Sample product data:', products.slice(0, 3));
            console.log('Sample match data:', matchTable.slice(0, 3));

            await DataIngestionController.storeDataInDatabase(products, matchTable);

            res.send('Data ingestion completed');
        } catch (error) {
            console.error('Error during data ingestion:', error);
            res.status(500).send(`Error during data ingestion: ${error.message}`);
        }
    }

    static readCsvFile(filename) {
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

    static async storeDataInDatabase(products, matchTable) {
        const db = new sqlite3.Database(dbPath);
        let transactionActive = false;

        try {
            await DataIngestionController.runQuery(db, "BEGIN TRANSACTION");
            transactionActive = true;

            const productColumns = Object.keys(products[0]).filter(col => col !== 'id');
            const matchColumns = Object.keys(matchTable[0]).filter(col => col !== 'id');

            const escapedProductColumns = productColumns.map(col => `"${col}"`);
            const escapedMatchColumns = matchColumns.map(col => `"${col}"`);

            await DataIngestionController.runQuery(db, `CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, ${escapedProductColumns.map(col => `${col} TEXT`).join(', ')})`);
            await DataIngestionController.runQuery(db, `CREATE TABLE IF NOT EXISTS match_table (id INTEGER PRIMARY KEY AUTOINCREMENT, ${escapedMatchColumns.map(col => `${col} TEXT`).join(', ')})`);

            const insertProduct = await DataIngestionController.prepareStatement(db, `INSERT INTO products (${escapedProductColumns.join(', ')}) VALUES (${productColumns.map(() => '?').join(', ')})`);
            for (const product of products) {
                const values = productColumns.map(col => product[col]);
                await DataIngestionController.runStatement(insertProduct, values);
            }
            await DataIngestionController.finalizeStatement(insertProduct);

            const insertMatch = await DataIngestionController.prepareStatement(db, `INSERT INTO match_table (${escapedMatchColumns.join(', ')}) VALUES (${matchColumns.map(() => '?').join(', ')})`);
            for (const match of matchTable) {
                const values = matchColumns.map(col => match[col]);
                await DataIngestionController.runStatement(insertMatch, values);
            }
            await DataIngestionController.finalizeStatement(insertMatch);

            await DataIngestionController.runQuery(db, "COMMIT");
            transactionActive = false;

            const { count: productCount } = await DataIngestionController.getFirstRow(db, "SELECT COUNT(*) AS count FROM products");
            const { count: matchCount } = await DataIngestionController.getFirstRow(db, "SELECT COUNT(*) AS count FROM match_table");
            console.log(`Inserted ${productCount} products and ${matchCount} matches into the database`);

            const sampleProducts = await DataIngestionController.getAllRows(db, "SELECT * FROM products LIMIT 3");
            const sampleMatches = await DataIngestionController.getAllRows(db, "SELECT * FROM match_table LIMIT 3");
            console.log('Sample inserted products:', sampleProducts);
            console.log('Sample inserted matches:', sampleMatches);

        } catch (error) {
            if (transactionActive) {
                await DataIngestionController.runQuery(db, "ROLLBACK");
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

    static runQuery(db, sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static prepareStatement(db, sql) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(sql, (err) => {
                if (err) reject(err);
                else resolve(stmt);
            });
        });
    }

    static runStatement(stmt, params) {
        return new Promise((resolve, reject) => {
            stmt.run(params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    static finalizeStatement(stmt) {
        return new Promise((resolve, reject) => {
            stmt.finalize((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    static getFirstRow(db, sql, params = []) {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static getAllRows(db, sql, params = []) {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = DataIngestionController;
