const express = require('express');
const router = express.Router();
const { loginUsuario } = require('../Controllers/loginController');

router.post('/login', loginUsuario);

module.exports = router;
