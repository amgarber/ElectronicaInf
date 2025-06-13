const express = require('express');
const router = express.Router();
const { responderSolicitudManual } = require('../Controllers/SolicitudesController');

router.post('/responder-solicitud', responderSolicitudManual);

module.exports = router;
