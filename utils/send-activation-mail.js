const fs = require('fs');
//const nodemailer = require('nodemailer');
const activationTemplate = fs.readFileSync('./templates/activation.html', {
    encoding: 'utf-8'
});
const User = require('../models/user');
//const transporter = nodemailer.createTransport(require('../configs/gmail.json'));
const rand = require('rand-token');
const sendMail = require('./send-mail');
module.exports = function (email) {
    const token = rand.uid(256);
    const activationLink = `http://localhost:4200/activate;token=${token}`;
    const message = activationTemplate.replace(/activationLink/g, activationLink);
    return new Promise(async (resolve, reject) => {
        const user = await User.findOne({
            email
        }).exec();
        if (!user) {
            let err = new Error('no user found');
            err.status = 404;
            return reject(err);
        } else {
            user.activationToken = token;
            user.tokenExpiration = new Date(Date.now() + (60 * 60 * 1000));
            const mail = {
                subject: 'Account activation',
                recipient: email,
                message
            }
            await user.save();
            sendMail(mail);
            resolve();
        }
    });
};