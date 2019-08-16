const express = require('express');
const router = express.Router();
const User = require('../models/user');
const sendResetMail = require('../utils/send-reset-mail');
const bcrypt = require('bcrypt');

module.exports = (client) => {
    const validateToken = require('../middlewares/validate-token')(client);
    router.post('/password/reset', async (req, res, next) => {
        try {
            await sendResetMail(req.body.email);
            res.json({
                message: 'success'
            });
        } catch (e) {
            next(e);
        }
    });
    router.get('/password/token/:token/verify', async (req, res, next) => {
        const {
            token
        } = req.params;
        try {
            const now = Date.now();
            const user = await User.findOne({
                'passwordReset.token': token,
                'passwordReset.expiration': {
                    $gt: now
                }
            }).exec();
            if (!user) {
                let err = new Error('not found');
                err.status = 404;
                throw err;
            }
            res.json({
                message: 'valid token'
            });
        } catch (e) {
            next(e);
        }
    });

    router.post('/password/reset/confirm', async (req, res, next) => {
        // for a user to reset their password we need 3 things
        // a token generated for thei account
        // their new password and password confirm
        const {
            token,
            password,
            passwordConfirm
        } = req.body;
        // Let's check if token is valid
        try {
            const now = Date.now();
            const user = await User.findOne({
                'passwordReset.token': token,
                'passwordReset.expiration': {
                    $gt: now
                }
            }).exec();
            if (!user) {
                let err = new Error('not found');
                err.status = 404;
                throw err;
            }
            const isPasswordMissing = !password || !passwordConfirm;
            const arePasswordsSame = password == passwordConfirm;
            if (isPasswordMissing || !arePasswordsSame) {
                let err = new Error('missing password or invalid token');
                err.status = 400;
                throw err;
            }
            // will update user password
            user.password = await bcrypt.hash(password, 10);
            user.passwordReset = {
                token: null,
                expiration: null
            };
            await user.save();
            res.json({
                message: 'user password updated'
            });
        } catch (e) {
            next(e);
        }
    });

    router.put('/:id/update', validateToken, async (req, res, next) => {
        const {
            id
        } = req.params;
        const dbUser = await User.findById(id).exec();
        const tokenUser = res.locals.user;
        try {
            if (!dbUser) {
                let err = new Error("user not found");
                err.status = 404;
                throw err
            }
            if (dbUser._id != tokenUser._id) {
                //Some logged in user is trying to update another users profile
                // Don't let that happen
                let err = new Error("access denied");
                err.status = 401;
                throw err
            }
            const {
                name,
                surname
            } = req.body;
            if (!name || !surname) {
                let err = new Error("insert name and surname");
                err.status = 400;
                throw err;
            }
            dbUser.set({
                name,
                surname
            });
            await dbUser.save();
            res.json({
                message: 'user updated'
            });
        } catch (e) {
            next(e);
        }

    });
    return router;
};