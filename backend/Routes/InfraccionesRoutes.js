// backend/Routes/infraccionesRoutes.js
const express = require('express');
const router = express.Router();
const { getInfracciones } = require('../Controllers/InfraccionesController');

router.get('/', getInfracciones);

module.exports = router;
