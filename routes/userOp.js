const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

// Register for event
router.get('/register/:eventId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const userId = req.user._id;

        // Check if the user is already a volunteer
        if (event.registeredVolunteers.includes(userId)) {
            // Remove user from volunteers if they are volunteering
            event.registeredVolunteers = event.registeredVolunteers.filter(volunteer => volunteer.toString() !== userId.toString());
        }

        // Toggle registration for participants
        if (event.registeredUsers.includes(userId)) {
            // Remove user from participants if already registered
            event.registeredUsers = event.registeredUsers.filter(user => user.toString() !== userId.toString());
        } else {
            // Check if maxParticipants limit is reached
            if (event.registeredUsers.length >= event.maxParticipants) {
                return res.status(400).send('The event has reached the maximum number of participants.');
            }
            // Add user to participants
            event.registeredUsers.push(userId);
        }

        await event.save();
        res.redirect('/dashboard'); // Redirect back to the dashboard after registration
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// Volunteer for event
router.get('/volunteer/:eventId', async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const userId = req.user._id;

        // Check if the user is already a participant
        if (event.registeredUsers.includes(userId)) {
            // Remove user from participants if they are registered
            event.registeredUsers = event.registeredUsers.filter(user => user.toString() !== userId.toString());
        }

        // Toggle registration for volunteers
        if (event.registeredVolunteers.includes(userId)) {
            // Remove user from volunteers if already volunteering
            event.registeredVolunteers = event.registeredVolunteers.filter(volunteer => volunteer.toString() !== userId.toString());
        } else {
            // Check if maxVolunteers limit is reached
            if (event.registeredVolunteers.length >= event.maxVolunteers) {
                return res.status(400).send('The event has reached the maximum number of volunteers.');
            }
            // Add user to volunteers
            event.registeredVolunteers.push(userId);
        }

        await event.save();
        res.redirect('/dashboard'); // Redirect back to the dashboard after volunteer registration
    } catch (error) {
        res.status(500).send('Server error');
    }
});

module.exports = router;
