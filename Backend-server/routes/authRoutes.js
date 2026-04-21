const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// Ye path banega: /api/auth/login
router.post('/login', loginUser);

module.exports = router;