const DataIngestionModel = require('../models/DataIngestionModel');
const fs = require('fs').promises;

class DataIngestionController {
    constructor(dbPath) { 
        this.model = new DataIngestionModel(dbPath);
    }

    async ingestData(req, res) {
        try {
            // Check if files are present in the request
            if (!req.files || !req.files['products'] || !req.files['matches']) {
                return res.status(400).json({ error: 'Missing required CSV files' });
            }

            const productsCsvPath = req.files['products'][0].path;
            const matchesCsvPath = req.files['matches'][0].path;

            // Validate file paths
            if (!productsCsvPath || !matchesCsvPath) {
                return res.status(400).json({ error: 'Invalid file paths' });
            }

            // Ingest data
            const result = await this.model.ingestData(productsCsvPath, matchesCsvPath);

            // Delete CSV files after ingestion
            await fs.unlink(productsCsvPath);
            await fs.unlink(matchesCsvPath);

            res.status(200).json({
                message: 'Data ingestion completed successfully',
                productsIngested: result.productsCount,
                matchesIngested: result.matchesCount
            });
        } catch (error) {
            console.error('Error during data ingestion:', error);
            res.status(500).json({ error: 'Error during data ingestion', details: error.message });
        }
    }
}

module.exports = DataIngestionController;