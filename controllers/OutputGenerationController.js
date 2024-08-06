class OutputGenerationController {
    static async generateOutput(req, res) {
        const { format } = req.query;

        if (format === 'csv') {
            // Generate CSV output
            const output = [];
            db.all("SELECT * FROM related_manufacturers", (err, rows) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error generating CSV output');
                }

                output.push('manufacturer,related_manufacturer');
                rows.forEach(row => {
                    output.push(`${row.manufacturer},${row.related_manufacturer}`);
                });

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=related_manufacturers.csv');
                res.send(output.join('\n'));
            });
        } else {
            // Default to SQLite output
            const outputDb = new sqlite3.Database('output.db');
            db.backup(outputDb)
                .then(() => {
                    console.log('Backup completed');
                    res.download('output.db', 'related_manufacturers.db', (err) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send('Error generating SQLite output');
                        }
                        outputDb.close();
                    });
                })
                .catch((err) => {
                    console.error('Backup failed:', err);
                    res.status(500).send('Error generating SQLite output');
                });
        }
    }
}

module.exports = OutputGenerationController;