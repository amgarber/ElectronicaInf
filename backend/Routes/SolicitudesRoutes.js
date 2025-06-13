const express = require('express');
const router = express.Router();

try {
    const { responderSolicitudManual } = require('../Controllers/SolicitudesController');
    console.log("✅ Controller cargado");
    router.post('/responder-solicitud', responderSolicitudManual);
} catch (error) {
    console.error("❌ Error al cargar responderSolicitudManual:", error.message);
}

module.exports = router;
