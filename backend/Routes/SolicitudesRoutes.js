const express = require('express');
const router = express.Router();

router.post('/responder-solicitud', (req, res) => {
    res.json({ message: `🧠 Esta ruta está definida en: ${__filename}` });
});

module.exports = router;
