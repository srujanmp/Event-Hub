const mongoose = require('mongoose');
const User = require('../models/User');


const EventSchema = new mongoose.Schema({
    eventDescription: {
        type: String,
        required: true,
        trim: true
    },
    eventExpectation: {
        type: String,
        required: true,
        trim: true
    },
    usersInterested: {
        type: [mongoose.Schema.Types.ObjectId], // Array of user IDs
        ref: 'User',
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('EventRequest', EventSchema);
