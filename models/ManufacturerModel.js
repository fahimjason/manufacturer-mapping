const { closeDb, getDB, runQuery, getAllRows, getFirstRow } = require('../config/db');

class ManufacturerModel {
    constructor(dbPath) {
        this.dbPath = dbPath;
    }

    async getAllManufacturerPairs() {
        const db = getDB(this.dbPath);
        try {
            return await getAllRows(db, `
                SELECT p1.manufacturer AS m1, p2.manufacturer AS m2
                FROM match_table mt
                JOIN products p1
                    ON mt.m_source = p1.source
                    AND mt.m_source_id = p1.source_id
                JOIN products p2
                    ON mt.c_source = p2.source
                    AND mt.c_source_id = p2.source_id
                WHERE p1.manufacturer != p2.manufacturer
            `);
        } finally {
            await closeDb(db);
        }
    }

    async removeDuplicates() {
        const db = getDB(this.dbPath);
        try {
            return await runQuery(db, `
                DELETE FROM products 
                WHERE id NOT IN (
                    SELECT MIN(id) 
                    FROM products 
                    GROUP BY title, manufacturer, source, source_id, country_code, barcode, composition
                )
            `);
        }  finally {
            await closeDb(db);
        }
    }

    async standardizeManufacturerNames() {
        const db = getDB(this.dbPath);
        try {
            return await runQuery(db, `
                UPDATE products 
                SET manufacturer = REPLACE(
                    REPLACE(manufacturer, ' Inc.', ''),
                    ' Incorporated', ''
                )
            `);
        } finally {
            await closeDb(db);
        }
    }

    async getTotalProducts() {
        const db = getDB(this.dbPath);
        try {
            const result = await getFirstRow(db, "SELECT COUNT(*) as count FROM products");
            return result.count;
        } finally {
            await closeDb(db);
        }
    }

    async createRelatedManufacturersTable() {
        const db = getDB(this.dbPath);
        try {
            await runQuery(db, "CREATE TABLE IF NOT EXISTS related_manufacturers (manufacturer TEXT, related_manufacturer TEXT)");
        } finally {
            await closeDb(db);
        }
    }

    async insertRelatedManufacturers(manufacturer, relatedManufacturer) {
        const db = getDB(this.dbPath);
        try {
            const stmt = db.prepare("INSERT INTO related_manufacturers VALUES (?, ?)");
            await runQuery(db, stmt, [manufacturer, relatedManufacturer]);
            stmt.finalize();
        } catch (error) {
            console.error(`Error inserting related manufacturers: ${manufacturer} - ${relatedManufacturer}`, error);
            throw error;
        } finally {
            await closeDb(db);
        }
    }
}

module.exports = ManufacturerModel;