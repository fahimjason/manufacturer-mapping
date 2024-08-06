class ValidationController {
    static async validateMappings(req, res) {
        const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
        const suspiciousMappings = [];

        db.all("SELECT * FROM related_manufacturers", (err, mappings) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error validating mappings');
            }

            mappings.forEach(mapping => {
                if (commonWords.includes(mapping.manufacturer.toLowerCase()) ||
                    commonWords.includes(mapping.related_manufacturer.toLowerCase())) {
                    suspiciousMappings.push(mapping);
                }
            });

            res.json({
                message: 'Validation completed',
                suspiciousMappings: suspiciousMappings
            });
        });
    }
}

module.exports = ValidationController;