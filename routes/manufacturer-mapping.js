const express = require('express');
const path = require('path');
const ManufacturerModel = require('../models/ManufacturerModel');
const ManufacturerMappingController = require('../controllers/ManufacturerMappingController');

const router = express.Router();

const dbPath = path.resolve(__dirname, `${process.env.INSERT_DB_PATH}/${process.env.INSERT_DB_NAME}.db`);

const manufacturerModel = new ManufacturerModel(dbPath);
const manufacturerMappingController = new ManufacturerMappingController(manufacturerModel);

router.get('/', (req, res) => {
    manufacturerMappingController.mapManufacturers(req, res)
        .catch(error => {
            console.error('Unhandled error in route handler:', error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        });
});

module.exports = router;