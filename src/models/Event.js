const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: {
        type: String,
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
    deviceId: {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model('Event', eventSchema);
