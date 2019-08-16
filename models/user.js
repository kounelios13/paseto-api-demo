const mongoose = require('mongoose');

const schema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        default: ''
    },
    surname: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        default: 'inactive'
    },
    activationToken: {
        type: String,
        default: null
    },
    tokenExpiration: {
        type: Date,
        default: null
    },
    passwordReset: {
        token: {
            type: String,
            default: null
        },
        expiration: {
            type: Date,
            default: null
        }
    }
});
const User = mongoose.model('User', schema);

module.exports = User;