const express = require('express');
const router = express.Router();
const EventRequest = require('../models/ReqEvent');

router.get('/eventreq', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error_msg', 'Unauthorized access.');
        return res.redirect('/auth/login');
    }

    try {
        // Fetch all event requests from the database
        const eventRequests = await EventRequest.find();

        // Render the eventReq view with the fetched event requests
        res.render('eventReq', { eventRequests });
    } catch (error) {
        console.error('Error fetching event requests:', error);
        req.flash('error_msg', 'Error fetching event requests.');
        res.redirect('/dashboard');
    }
});

  router.post('/event-request', async (req, res) => {
    try {
        const { eventDescription, eventExpectation, usersInterested } = req.body;

        if (!eventDescription || !eventExpectation) {
            throw new Error('Missing required fields');
        }

        const newEvent = new EventRequest({
            eventDescription,
            eventExpectation,
            usersInterested
        });

        await newEvent.save();
        req.flash('success_msg', 'Request created successfully!');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error creating event:', error);
        req.flash('error_msg', 'Error creating request.');
        res.redirect('requestEvent');
    }
});

router.post('/eventreq/:id/toggle-interest', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error_msg', 'Unauthorized access.');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const eventId = req.params.id;
        const userId = req.user._id;

        // Find the event request
        const event = await EventRequest.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if the user is already interested
        const isInterested = event.usersInterested.includes(userId);

        if (isInterested) {
            // If already interested, remove the user from the list
            event.usersInterested = event.usersInterested.filter(
                (user) => !user.equals(userId)
            );
        } else {
            // Otherwise, add the user to the list
            event.usersInterested.push(userId);
        }

        // Save the updated event
        await event.save();

        // Send the updated number of interested users
        res.json({ interestedCount: event.usersInterested.length });
    } catch (error) {
        console.error('Error toggling interest:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

module.exports = router;