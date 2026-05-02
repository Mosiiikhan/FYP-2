const express = require('express');
const router = express.Router();
const eventController = require('../controllers/datacell/eventController'); 

<<<<<<< HEAD
// --- 1. Purane Basic Routes (Events & Societies) ---
=======
// --- Purane Routes (Pehle se maujood) ---
>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
router.get('/societies', eventController.getSocieties);
router.get('/all', eventController.getAllEvents);
router.post('/add', eventController.saveEvent);
router.delete('/delete/:id', eventController.deleteEvent);
<<<<<<< HEAD
router.put('/update/:id', eventController.updateEvent); // Edit function k liye

// ======================================================
// ✅ 2. NAYE ROUTES (Societies Subscription Logic)
// ======================================================

// Dropdown mein status check karne k liye
router.get('/societies-status', eventController.getSocietiesStatus);

// Subscribe karne k liye
router.post('/subscribe', eventController.subscribeSociety);

// Unsubscribe karne k liye
router.post('/unsubscribe', eventController.unsubscribeSociety);

// ======================================================
// 🎯 3. CHAIRPERSON FOCUS ROUTE (Society Identity)
// ======================================================

// Chairperson jab sidebar se color select karke lock karega toh ye chalega
router.post('/lock-color', eventController.lockSocietyColor);

=======

// ======================================================
// ✅ NAYE ROUTES (Societies Subscription k liye)
// ======================================================

// 1. Dropdown mein status check karne k liye
router.get('/societies-status', eventController.getSocietiesStatus);

// 2. Subscribe karne k liye
router.post('/subscribe', eventController.subscribeSociety);

// 3. Unsubscribe karne k liye
router.post('/unsubscribe', eventController.unsubscribeSociety);

>>>>>>> edd2f9e2a8986959020420b3e53294d4dbbedaa4
module.exports = router;