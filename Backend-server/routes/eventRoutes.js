const express = require('express');
const router = express.Router();
const eventController = require('../controllers/datacell/eventController'); 

// --- Purane Routes (Pehle se maujood) ---
router.get('/societies', eventController.getSocieties);
router.get('/all', eventController.getAllEvents);
router.post('/add', eventController.saveEvent);
router.delete('/delete/:id', eventController.deleteEvent);

// ======================================================
// ✅ NAYE ROUTES (Societies Subscription k liye)
// ======================================================

// 1. Dropdown mein status check karne k liye
router.get('/societies-status', eventController.getSocietiesStatus);

// 2. Subscribe karne k liye
router.post('/subscribe', eventController.subscribeSociety);

// 3. Unsubscribe karne k liye
router.post('/unsubscribe', eventController.unsubscribeSociety);

module.exports = router;