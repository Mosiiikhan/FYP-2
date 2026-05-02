const express = require('express');
const router = express.Router();

// Sahi Path: routes folder se bahar nikal kar (../), controllers/Admin folder mein jao
const IslamicHolidaysController = require('../controllers/Admin/islamicHolidaysController');

// Routes define karein
router.get('/get-hijri-offset', IslamicHolidaysController.getIslamicOffset);
router.put('/update-hijri-offset', IslamicHolidaysController.updateIslamicOffset);

module.exports = router;