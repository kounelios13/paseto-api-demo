const express = require('express');
const bcrypt = require('bcrypt');
const randomToken = require('rand-token');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');
const hash = require('../middlewares/hash');
const settings = require('../configs/settings');
module.exports = function (client) {
    router.post('/', async (req, res, next) => {
        try {
            const {
                email,
                password
            } = req.body;
            const user = await User.findOne({
                email
            }).exec();
            if (!user) {
                const err = new Error('user not found');
                err.code = 400;
                throw err;
            }
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                const err = new Error('invalid credentials');
                err.status = 401;
                throw err;
            }
            const accessToken = jwt.sign(user.toObject({
                versionKey: false,
                virtuals: false
            }), settings.jwtSecret, {
                expiresIn: '5m'
            });
            const refreshToken = randomToken.uid(256);
            // Each refresh token should be valid for 20 mins
            const tokenValidity = 20 * 60;
            await client.set(refreshToken, user.email, "EX", tokenValidity);
            return res.json({
                accessToken,
                refreshToken
            });
        } catch (e) {
            return res.status(500).json({
                message: e.message
            });
        }
    });
    return router;
};