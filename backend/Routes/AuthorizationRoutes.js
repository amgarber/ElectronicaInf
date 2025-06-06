const express = require('express');
const router = express.Router();
const { getAuthorizations } = require('../Controllers/authorizationsController');

router.get('/my-authorizations', getAuthorizations);

module.exports = router;
