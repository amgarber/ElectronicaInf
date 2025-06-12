const express = require('express');
const router = express.Router();
const { getAuthorizations } = require('../Controllers/AuthorizationsController');

router.get('/my-authorizations', getAuthorizations);

module.exports = router;
