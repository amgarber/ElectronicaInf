const express = require('express');
const router = express.Router();
const { responderSolicitudManual } = require('../Controllers/SolicitudesController');

router.post('/solicitudes/responder', responderSolicitudManual);

module.exports = router;
