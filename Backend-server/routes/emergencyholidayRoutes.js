const express = require('express');
const router = express.Router();
// 'admin' ko 'Admin' kar dein jaisa aapne folder ka naam rakha hai
const emergencyholidayController = require('../controllers/Admin/emergencyholidayController');

// 🚩 Yahan sirf '/' hona chahiye. 
// Server.js isay khud hi '/api/emergencyholiday' bana deta hai.
router.get('/', emergencyholidayController.getAllHolidays);
router.post('/add', emergencyholidayController.addHoliday);
router.put('/update/:id', emergencyholidayController.updateHoliday);
router.delete('/:id', emergencyholidayController.deleteHoliday);

module.exports = router;