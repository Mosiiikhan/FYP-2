const express = require('express');
const router = express.Router();
const multer = require('multer');
// 🟢 'examControllers' (galat) ko badal kar 'examController' (sahi) kar diya
const examScheduleController = require('../controllers/examScheduleController');

// File storage settings
const upload = multer({ dest: 'uploads/' });

// Route: image_3384f3.png wali screen yahan hit karegi
router.post('/upload-datesheet', upload.single('file'), examScheduleController.uploadDatesheet);

module.exports = router;