const { getDB } = require("../config/db");

class ProductTitleController {
    constructor(dbPath) {
        this.dbPath = dbPath;
    }

    async assignManufacturer(req, res) {
        const { title } = req.query;
        const db = getDB(this.dbPath);

        if (!title) {
            return res.status(400).send('Product title is required');
        }

        const words = title.toLowerCase().split(' ');

        db.all("SELECT DISTINCT manufacturer FROM products", (err, manufacturers) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error assigning manufacturer');
            }

            const potentialManufacturers = manufacturers.filter(m =>
                words.some(word => m.manufacturer.toLowerCase().includes(word))
            );

            if (potentialManufacturers.length === 0) {
                return res.send('No manufacturer found');
            }

            // Simple scoring: choose the manufacturer with the longest name match
            const assignedManufacturer = potentialManufacturers.reduce((longest, current) =>
                current.manufacturer.length > longest.manufacturer.length ? current : longest
            );

            res.send(`Assigned manufacturer: ${assignedManufacturer.manufacturer}`);
        });
    }
}

module.exports = ProductTitleController;
