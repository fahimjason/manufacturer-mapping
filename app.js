// app.js
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, `data/${process.env.INSERT_DB_NAME}.db`);

// Load env variables
dotenv.config({ path: './config/config.env' });

// Controllers
const ProductTitleController = require('./controllers/ProductTitleController');
const ValidationController = require('./controllers/ValidationController');
const OutputGenerationController = require('./controllers/OutputGenerationController');

// Route files
const ingestData = require('./routes/data-ingestion');
const mapManufacturers = require('./routes/manufacturer-mapping');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/ingest-data', ingestData);
app.use('/map-manufacturers', mapManufacturers);

app.get('/assign-manufacturer', ProductTitleController.assignManufacturer);
app.get('/validate', ValidationController.validateMappings);
app.get('/generate-output', OutputGenerationController.generateOutput);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler caught an error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
});
