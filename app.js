// app.js
const express = require('express');
const dotenv = require('dotenv');

// Load env variables
dotenv.config({ path: './config/config.env' });

// Route files
const ingestData = require('./routes/data-ingestion');
const mapManufacturers = require('./routes/manufacturer-mapping');
const generateOutput = require('./routes/output-generate');
const assignManufacturer = require('./routes/assign-manufacturer');
const validate = require('./routes/validate');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/ingest-data', ingestData);
app.use('/map-manufacturers', mapManufacturers);
app.use('/assign-manufacturer', assignManufacturer);
app.use('/validate', validate);
app.use('/generate-output', generateOutput);

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
