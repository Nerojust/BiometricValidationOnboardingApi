// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    phonenumber: {
        type: String,
        validate: {
            validator: function (v) {
                // Simple phone number validation, you can enhance this as needed
                return /^[0-9]{11}$/.test(v);
            },
            message: 'Invalid phone number',
        },
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    fingerprintkey: {
        type: String,
        minlength: 10,
    },
});

module.exports = mongoose.model('User', userSchema);
