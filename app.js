// app.js
const express = require('express');
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, 'data/manufacturers.db');

// Controllers
const DataPreprocessingController = require('./controllers/DataPreprocessingController');
const ManufacturerMappingController = require('./controllers/ManufacturerMappingController');
const ProductTitleController = require('./controllers/ProductTitleController');
const ValidationController = require('./controllers/ValidationController');
const OutputGenerationController = require('./controllers/OutputGenerationController');

// Route files
const ingestRoute = require('./routes/data-ingestion-routes');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

const dataPreprocessingController = new DataPreprocessingController(dbPath);

// Routes
app.use('/ingest-data', ingestRoute);

app.post('/preprocess-data', async (req, res) => {
    try {
        await dataPreprocessingController.preprocessData(req, res);
    } catch (error) {
        console.error('Error in preprocessing route:', error);
        res.status(500).json({ error: 'Internal server error during preprocessing' });
    }
});

// app.get('/preprocess', DataPreprocessingController.preprocessData);
app.get('/map-manufacturers', ManufacturerMappingController.mapManufacturers);
app.get('/assign-manufacturer', ProductTitleController.assignManufacturer);
app.get('/validate', ValidationController.validateMappings);
app.get('/generate-output', OutputGenerationController.generateOutput);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});