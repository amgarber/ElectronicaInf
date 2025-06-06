const express = require('express');
const router = express.Router();
const { getProfile } = require('../Controllers/ProfileController');

router.get('/profile', getProfile);

module.exports = router;

