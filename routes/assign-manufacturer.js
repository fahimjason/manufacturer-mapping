const express = require('express');
const path = require('path');
const ProductTitleController = require('../controllers/ProductTitleController');

const router = express.Router();

const dbPath = path.resolve(__dirname, `${process.env.INSERT_DB_PATH}/${process.env.INSERT_DB_NAME}.db`);
const productTitleController = new ProductTitleController(dbPath);

router.get('/', async (req, res) => {
    try {
        await productTitleController.assignManufacturer(req, res);
    } catch (error) {
        console.error('Unhandled error in route handler:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;