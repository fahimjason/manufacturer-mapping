const express = require('express');
const path = require('path');
const ValidationController = require('../controllers/ValidationController');

const router = express.Router();

const dbPath = path.resolve(__dirname, `${process.env.INSERT_DB_PATH}/${process.env.INSERT_DB_NAME}.db`);
const validationController = new ValidationController(dbPath);

router.get('/', async (req, res) => {
    try {
        await validationController.validateMappings(req, res);
    } catch (error) {
        console.error('Unhandled error in route handler:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;