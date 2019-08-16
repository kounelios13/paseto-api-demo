const bcrypt = require('bcrypt');

/**
 * Hash password contained in a request
 * @param {*} req An incoming request
 * @param {*} res Response
 * @param {*} next The next middleware
 */
async function hash(req, res, next) {
    const rounds = 10;
    const {
        password
    } = req.body;
    if (!password) {
        return next();
    }
    req.body.password = await bcrypt.hash(password, rounds);
    return next();
}

module.exports = hash;