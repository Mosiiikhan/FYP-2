const express = require('express');
const router = express.Router();

// ✅ Path ab bilkul sahi hai kyunke file 'controllers' folder mein hai
const holidayController = require('../controllers/holidayController');

// 1. Get definitions for dropdown
router.get('/definitions', holidayController.getDefinitions);

// 2. Save new holiday record
router.post('/save', holidayController.saveHoliday);

module.exports = router;