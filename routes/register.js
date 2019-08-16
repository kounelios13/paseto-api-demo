const express = require('express');
const router = express.Router();
const User = require('../models/user');
const hash = require('../middlewares/hash');
const sendActivationMail = require('../utils/send-activation-mail');
const rand = require('rand-token');
router.post('/', hash, async (req, res, next) => {
    const {
        email,
        password
    } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: 'email or password missing'
        });
    }

    try {
        // Make sure that the user we attempt to create does'nt exist 
        // already
        const userExists = await User.findOne({
            email
        }).exec();
        if (userExists) {
            const err = new Error('user exists');
            err.code = 400;
            throw err
        }
        const user = new User({
            email,
            password
        });
        await user.save();

        await sendActivationMail(email);
        return res.json({
            message: 'user created'
        });
    } catch (e) {
        console.log(e)
        next(e);
    }
});

module.exports = router;