const express = require('express');
const path = require('path');
const OutputGenerationController = require('../controllers/OutputGenerationController');

const router = express.Router();

const dbPath = path.resolve(__dirname, `${process.env.INSERT_DB_PATH}/${process.env.INSERT_DB_NAME}.db`);
const outputGenerationController = new OutputGenerationController(dbPath);

router.get('/', async (req, res) => {
    try {
        await outputGenerationController.generateOutput(req, res);
    } catch (error) {
        console.error('Unhandled error in route handler:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;