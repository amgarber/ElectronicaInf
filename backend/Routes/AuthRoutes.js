const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../Controllers/authController');

router.post('/registrarUsuario', registrarUsuario);

module.exports = router;
