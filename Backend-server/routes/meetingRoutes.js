const express = require('express');
const router = express.Router();

// Tumhara controller folder structure: controllers -> AssistantDirector -> meetingController
const { addMeeting } = require('../controllers/AssistantDirector/meetingController');

// Route: http://localhost:5000/api/meetings/add
router.post('/add', addMeeting);

module.exports = router;