class ManufacturerMappingController {
    static async mapManufacturers(req, res) {
        const relatedManufacturers = new Map();

        db.all("SELECT p1.manufacturer AS m1, p2.manufacturer AS m2 FROM match_table mt JOIN products p1 ON mt.m_source = p1.source AND mt.m_source_id = p1.id JOIN products p2 ON mt.c_source = p2.source AND mt.c_source_id = p2.id WHERE p1.manufacturer != p2.manufacturer", (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error mapping manufacturers');
            }

            rows.forEach(row => {
                if (!relatedManufacturers.has(row.m1)) {
                    relatedManufacturers.set(row.m1, new Set());
                }
                relatedManufacturers.get(row.m1).add(row.m2);

                if (!relatedManufacturers.has(row.m2)) {
                    relatedManufacturers.set(row.m2, new Set());
                }
                relatedManufacturers.get(row.m2).add(row.m1);
            });

            // Store related manufacturers in the database
            db.run("CREATE TABLE related_manufacturers (manufacturer TEXT, related_manufacturer TEXT)");
            const stmt = db.prepare("INSERT INTO related_manufacturers VALUES (?, ?)");
            relatedManufacturers.forEach((related, manufacturer) => {
                related.forEach(relatedManufacturer => {
                    stmt.run(manufacturer, relatedManufacturer);
                });
            });
            stmt.finalize();

            res.send('Manufacturer mapping completed');
        });
    }
}

module.exports = ManufacturerMappingController;