const fs = require('fs');
const nodemailer = require('nodemailer');
const activationTemplate = fs.readFileSync('./templates/activation.html', {
    encoding: 'utf-8'
});
const User = require('../models/user');
const transporter = nodemailer.createTransport(require('../configs/gmail.json'));

module.exports = function ({
    subject,
    message,
    recipient
}) {
    const mail = {
        subject: subject,
        to: recipient,
        html: message
    };
    return transporter.sendMail(mail);
};