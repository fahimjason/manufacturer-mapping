const express = require('express');
const multer = require('multer');
const path = require('path');

const DataIngestionController = require('../controllers/DataIngestionController');

const router = express.Router({ mergeParams: true });
const upload = multer({ dest: 'uploads/' });

const dbPath = path.join(__dirname, '../data/manufacturers.db');

const dataIngestionController = new DataIngestionController(dbPath);


router.route('/')
    .post(upload.fields([
    { name: 'products', maxCount: 1 },
    { name: 'matches', maxCount: 1 }
]), (req, res) => dataIngestionController.ingestData(req, res));


module.exports = router;