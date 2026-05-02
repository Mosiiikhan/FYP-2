const express = require('express');
const router = express.Router();
const eventController = require('../controllers/datacell/eventController'); 

// --- 1. Purane Basic Routes (Events & Societies) ---
router.get('/societies', eventController.getSocieties);
router.get('/all', eventController.getAllEvents);
router.post('/add', eventController.saveEvent);
router.delete('/delete/:id', eventController.deleteEvent);
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

module.exports = router;