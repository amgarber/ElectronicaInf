// backend/routes/entryRoutes.js
const express = require('express');
const router = express.Router();
const { autorizarEntrada } = require('../Controllers/EntryController');

router.post('/authorize-entry', autorizarEntrada);

module.exports = router;
