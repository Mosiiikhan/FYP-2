const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

// 🟢 Route for Bulk Enrollment Upload via Excel
// URL: http://localhost:5000/api/enrollment/upload
router.post('/upload', enrollmentController.uploadEnrollments);

module.exports = router;