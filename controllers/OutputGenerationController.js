const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs').promises;

class OutputGenerationController {
    constructor(dbPath) {
        this.dbPath = dbPath;
    }

    async getDB() {
        return open({
            filename: this.dbPath,
            driver: sqlite3.Database
        });
    }

    async generateOutput(req, res) {
        const { format } = req.query;
        const db = await this.getDB();

        try {
            if (format === 'csv') {
                await this.generateCSV(db, res);
            } else {
                await this.generateSQLite(res);
            }
        } finally {
            await db.close();
        }
    }

    async generateCSV(db, res) {
        const rows = await db.all("SELECT * FROM related_manufacturers");
        const output = ['manufacturer,related_manufacturer'];
        rows.forEach(row => {
            output.push(`${row.manufacturer},${row.related_manufacturer}`);
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=related_manufacturers.csv');
        res.send(output.join('\n'));
    }

    async generateSQLite(res) {
        const outputPath = 'output.db';
        
        try {
            // Copy the database file
            await fs.copyFile(this.dbPath, outputPath);
            
            res.download(outputPath, 'related_manufacturers.db', async (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    res.status(500).send('Error generating SQLite output');
                }
                // Clean up: remove the temporary file
                await fs.unlink(outputPath).catch(console.error);
            });
        } catch (error) {
            console.error('Error copying database:', error);
            res.status(500).send('Error generating SQLite output');
        }
    }
}

module.exports = OutputGenerationController;