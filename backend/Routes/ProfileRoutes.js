const express = require('express');
const router = express.Router();
const { getProfile, changePassword } = require('../Controllers/ProfileController');

// Sin middleware: la verificación del token ya está dentro del controller
router.get('/profile', getProfile);
router.post('/change-password', changePassword);

module.exports = router;
