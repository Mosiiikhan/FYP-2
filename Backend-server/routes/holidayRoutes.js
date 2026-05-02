const express = require('express');
const router = express.Router();

<<<<<<< HEAD
// Existing Controllers
const emergencyholidayController = require('../controllers/Admin/emergencyholidayController');

// 1. Naya Islamic Holiday Controller Import karein
const IslamicHolidaysController = require('../controllers/Admin/IslamicHolidaysController');

// --- Emergency Holiday Routes ---
router.get('/', emergencyholidayController.getAllHolidays);
router.post('/add', emergencyholidayController.addHoliday);
router.put('/update/:id', emergencyholidayController.updateHoliday);
router.delete('/:id', emergencyholidayController.deleteHoliday);

// --- 2. Islamic Holiday Adjustment Route ---
// Admin jab dashboard se adjustment karega toh is route par hit karega
router.put('/update-hijri-offset', IslamicHolidaysController.updateIslamicOffset);
=======
// ✅ Path ab bilkul sahi hai kyunke file 'controllers' folder mein hai
const holidayController = require('../controllers/holidayController');

// 1. Get definitions for dropdown
router.get('/definitions', holidayController.getDefinitions);

// 2. Save new holiday record
router.post('/save', holidayController.saveHoliday);
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4

module.exports = router;