const jwt = require('jsonwebtoken');
const settings = require('../configs/settings');
const createError = require('http-errors');
module.exports = function (client) {
    return async function validate(req, res, next) {
        console.log('validating auth')
        const authorization = req.header('Authorization');
        if (!authorization) {
            return next(createError(401, 'no token'));
        }
        const token = authorization.replace('Bearer ', '');
        // Load a list of invalid tokens
        try {
            // Load a list of tokens that have been loged out or blocked
            let tokens = JSON.parse(await client.get("invalid_tokens")) || [];
            const verifiedToken = jwt.verify(token, settings.jwtSecret);
            if (!token || !verifiedToken || tokens.includes(token)) {
                const err = new Error('invalid token');
                err.status = 401;
                throw err;
            }
            // pass user to next middleware
            res.locals.user = verifiedToken;
        } catch (e) {
            if (e.expiredAt) {
                // This is an expiration error. Set manually the response code so that express won't 
                // send a 500
                e.status = 401;
            }
            next(e);
        }

        return next();
    }
};