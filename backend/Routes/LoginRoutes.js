const express = require('express');
const router = express.Router();
const { loginUsuario } = require('../Controllers/LoginController');

router.post('/login', loginUsuario);

module.exports = router;
