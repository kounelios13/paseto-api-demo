const fs = require('fs');
//const nodemailer = require('nodemailer');
const template = fs.readFileSync('./templates/reset.html', {
    encoding: 'utf-8'
});
const User = require('../models/user');
//const transporter = nodemailer.createTransport(require('../configs/gmail.json'));
const rand = require('rand-token');
const sendMail = require('./send-mail');
module.exports = function (email) {
    const token = rand.uid(256);
    const resetLink = `http://localhost:4200/reset;token=${token}`;
    const message = template.replace(/passwordLink/g, resetLink);
    return new Promise(async (resolve, reject) => {
        const user = await User.findOne({
            email
        }).exec();
        if (!user) {
            let err = new Error('no user found');
            err.status = 404;
            return reject(err);
        } else {
            user.passwordReset = {
                token,
                expiration: new Date(Date.now() + (60 * 60 * 1000))
            };
            const mail = {
                subject: 'Password reset',
                recipient: email,
                message
            }
            await user.save();
            sendMail(mail);
            resolve();
        }
    });
};