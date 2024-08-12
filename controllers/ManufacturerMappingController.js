class ManufacturerMappingController {
    constructor(manufacturerModel) {
        this.manufacturerModel = manufacturerModel;
    }

    async mapManufacturers(req, res) {
        try {
            const { changes: duplicatesRemoved } = await this.manufacturerModel.removeDuplicates();
            const { changes: manufacturersUpdated } = await this.manufacturerModel.standardizeManufacturerNames();

            const totalProducts = await this.manufacturerModel.getTotalProducts();

            const rows = await this.manufacturerModel.getAllManufacturerPairs();

            const relatedManufacturers = new Map();

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

            await this.manufacturerModel.createRelatedManufacturersTable();

            for (const [manufacturer, related] of relatedManufacturers) {
                for (const relatedManufacturer of related) {
                    await this.manufacturerModel.insertRelatedManufacturers(manufacturer, relatedManufacturer);
                }
            }

            res.status(200).json({
                message: 'Manufacturer mapping and data preprocessing completed successfully',
                duplicatesRemoved,
                manufacturersUpdated,
                totalProducts
            });
        } catch (error) {
            console.error('Error in mapManufacturers method:', error);
            res.status(500).json({ error: 'Error during manufacturer mapping and data preprocessing', details: error.message });
        }
    }
}

module.exports = ManufacturerMappingController;
