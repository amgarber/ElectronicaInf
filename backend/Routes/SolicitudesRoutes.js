const express = require('express');
const router = express.Router();

router.post('/responder-solicitud', (req, res) => {
    console.log("✅ POST /api/responder-solicitud recibido");
    res.json({ message: 'Solicitud procesada (versión mínima)' });
});

module.exports = router;
