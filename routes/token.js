const express = require('express');
const router = express.Router();
const User = require('../models/user');
const settings = require('../configs/settings');
const jwt = require('jsonwebtoken');

const debug = require('debug')('app::token');
const sendActivationMail = require('../utils/send-activation-mail');


module.exports = function (client) {
    router.post('/reject', async (req, res, next) => {
        const token = req.header('Authorization').replace('Bearer ', '');
        let blocked = await client.get("invalid_tokens");
        //If running for the first time its possible not to have an array of blocked tokens
        if (!blocked || !Array.isArray(blocked)) {
            blocked = [];
        }
        blocked.push(token);
        debug(`Rejecting token:${token}`);
        // Update the list of blocked tokens in Redis
        await client.set("invalid_tokens", JSON.stringify(blocked));
        res.sendStatus(200);
    });

    router.post('/refresh', async (req, res, next) => {
        const {
            refreshToken
        } = req.body;

        const userEmail = await client.get(refreshToken);
        if (!userEmail) {
            // We couldn't find the refresh token in our storage
            // Either it is expired or invalid
            const err = new Error("invalid token");
            err.status = 401;
            next(err);
        }
        const userFound = await User.findOne({
            email: userEmail
        }).exec();
        if (!userFound) {
            const err = new Error();
            err.status = 400;
            next(err);
        }
        // Issue a new token
        const accessToken = jwt.sign(userFound.toObject(), settings.jwtSecret, {
            expiresIn: '5m'
        });
        res.json({
            accessToken,
            refreshToken
        });
    });

    router.post('/activate', async (req, res, next) => {
        const {
            token
        } = req.body;
        if (!token) {
            let err = new Error("invalid token");
            err.status = 400;
            return next(err);
        }
        try {
            let now = Date.now();
            let user = await User.findOne({
                activationToken: token,
                tokenExpiration: {
                    $gt: now
                }
            }).exec();
            if (!user) {
                console.log('no user')
                let err = new Error("invalid token");
                err.status = 404;
                throw err;
            }
            user.activationToken = null;
            user.status = 'active';
            await user.save();
            res.json({
                message: 'user activated'
            });
        } catch (e) {
            next(e);
        }
    });


    router.post('/resend', async (req, res, next) => {
        const {
            email
        } = req.body;
        try {
            // let user = await User.findOne({
            //     email
            // }).exec();
            // console.log(user.toObject())
            // user.activationToken = token;
            // user.tokenExpiration = new Date(Date.now() + (60 * 60 * 1000));
            // const mail = {
            //     subject: 'Account activation',
            //     to: user.email,
            //     html: message
            // }
            // await user.save();
            // await transporter.sendMail(mail);
            await sendActivationMail(email);
            res.json({
                message: 'Activation link send'
            })
        } catch (e) {
            console.log(e);
            next(e);
        }
    });
    return router;
}