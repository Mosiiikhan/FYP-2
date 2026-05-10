const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, createUser } = require('../controllers/Admin/Usermanagementcontroller');

// GET all users
// Path: GET /api/manage-users/all
router.get('/all', getAllUsers);

// UPDATE username and/or password of a user
// Path: PUT /api/manage-users/update/:id
router.put('/update/:id', updateUser);

// CREATE new user
// Path: POST /api/manage-users/create
router.post('/create', createUser);

module.exports = router;