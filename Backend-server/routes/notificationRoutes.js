// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
// Pehle folder se bahar niklein (../) phir controllers mein jayen
const NotifController = require('../controllers/notificationController'); 

router.get('/count', NotifController.getUnreadCount);
router.get('/list', NotifController.getStudentNotifications);
router.put('/read/:notificationId', NotifController.markAsRead);
router.put('/read-all', NotifController.markAllRead);

module.exports = router;