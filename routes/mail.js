const express = require('express');
const mailConfig = require('../configs/gmail.json');
const nodemailer = require('nodemailer');
const router = express.Router();
const transporter = nodemailer.createTransport(mailConfig);
const fs = require('fs');
const contactTemplate = fs.readFileSync('./templates/contact.html', {
    encoding: 'utf-8'
});
const {
    promisify
} = require('util');
router.post('/contact-us', async (req, res, next) => {
    const {
        sender,
        message
    } = req.body;
    const messageBody = contactTemplate.replace('$$$message$$$', message).replace('$$$sender$$$', sender);
    try {
        await transporter.sendMail({
            from: `Client ${sender} <${sender}>`,
            to: mailConfig.auth.user,
            subject: 'Contact support',
            html: messageBody
        })
        res.sendStatus(200);
    } catch (e) {
        next(e);
    }
});

module.exports = router;