const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../Controllers/AuthController');

router.post('/registrarUsuario', registrarUsuario);

module.exports = router;
