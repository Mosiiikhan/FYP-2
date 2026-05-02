const express = require('express');
const router = express.Router();

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

module.exports = router;