const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
router.get('/', (req, res, next) => {
    res.json(res.locals.user);
});


module.exports = router;