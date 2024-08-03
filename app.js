// app.js
const express = require('express');
// const csv = require('csv-parser');
// const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Database setup
const db = new sqlite3.Database(':memory:');

// Controllers
const DataIngestionController = require('./controllers/DataIngestionController');
const DataPreprocessingController = require('./controllers/DataPreprocessingController');
const ManufacturerMappingController = require('./controllers/ManufacturerMappingController');
const ProductTitleController = require('./controllers/ProductTitleController');
const ValidationController = require('./controllers/ValidationController');
const OutputGenerationController = require('./controllers/OutputGenerationController');

// Routes
app.get('/ingest', DataIngestionController.ingestData);
app.get('/preprocess', DataPreprocessingController.preprocessData);
app.get('/map-manufacturers', ManufacturerMappingController.mapManufacturers);
app.get('/assign-manufacturer', ProductTitleController.assignManufacturer);
app.get('/validate', ValidationController.validateMappings);
app.get('/generate-output', OutputGenerationController.generateOutput);

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});