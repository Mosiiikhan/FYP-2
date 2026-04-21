const express = require('express');
const router = express.Router();

const { 
    addMeeting, 
    getMeetings, 
    deleteMeeting, 
    updateMeeting 
} = require('../controllers/AssistantDirector/meetingController');

// Ye active routes hain, koi bhi comment nahi hai:
router.post('/add', addMeeting);    // Data bhejny k lea
router.get('/all', getMeetings);     // Data dekhny k lea
router.delete('/delete/:id', deleteMeeting); // Delete k lea
router.put('/update/:id', updateMeeting);    // Update k lea

module.exports = router;