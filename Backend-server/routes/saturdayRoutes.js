const express = require('express');
const router = express.Router();
// Import controller carefully
const saturdayController = require('../controllers/Admin/saturdayController');

// Ensure functions are defined before calling them
router.get('/', (req, res) => saturdayController.getAllSaturdays(req, res));
router.post('/add', (req, res) => saturdayController.addSaturday(req, res));
router.delete('/:id', (req, res) => saturdayController.deleteSaturday(req, res));

module.exports = router;