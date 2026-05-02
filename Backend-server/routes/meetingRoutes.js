const express = require('express');
const router = express.Router();

<<<<<<< HEAD
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
=======
// Tumhara controller folder structure: controllers -> AssistantDirector -> meetingController
const { addMeeting } = require('../controllers/AssistantDirector/meetingController');

// Route: http://localhost:5000/api/meetings/add
router.post('/add', addMeeting);
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4

module.exports = router;