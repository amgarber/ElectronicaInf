const express = require('express');
const router = express.Router();
const { getAllNotifications } = require('../Controllers/NotificationController');

router.get('/notifications', getAllNotifications);

module.exports = router;
