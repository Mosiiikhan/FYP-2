const express = require('express');
const router = express.Router();

// Existing Controllers (Jo aapne pehle se rakhe hain)
const emergencyholidayController = require('../controllers/Admin/emergencyholidayController');
const IslamicHolidaysController = require('../controllers/Admin/IslamicHolidaysController');

// --- 🟢 NEW: Holiday Controller for Definitions & Save ---
const holidayController = require('../controllers/holidayController'); 

// --- Emergency Holiday Routes (Don't Change) ---
router.get('/', emergencyholidayController.getAllHolidays);
router.post('/add', emergencyholidayController.addHoliday);
router.put('/update/:id', emergencyholidayController.updateHoliday);
router.delete('/:id', emergencyholidayController.deleteHoliday);

// --- 🎯 1. Holiday Definitions Route (Sidebar Fix) ---
// Frontend yahan hit karta hai: /api/holidays/definitions
router.get('/definitions', holidayController.getDefinitions);

// --- 🎯 2. Save Normal Holiday Route ---
// Frontend yahan hit karta hai: /api/holidays/save
router.post('/save', holidayController.saveHoliday);

// --- 🎯 3. Get All Holidays List ---
router.get('/all', holidayController.getHolidays);


// --- 2. Islamic Holiday Adjustment Route (Jaisa aapne kaha, No Changes) ---
router.put('/update-hijri-offset', IslamicHolidaysController.updateIslamicOffset);

module.exports = router;