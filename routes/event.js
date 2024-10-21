const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

router.get('/event/:eventId', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('success_msg', 'You are logged out');
        
        return res.redirect('/auth/login');
    }
    try {
        // Find the event by ID and populate registeredUsers and registeredVolunteers with their names and profile pictures
        const event = await Event.findById(req.params.eventId)
            .populate('registeredUsers', 'name profilePicture')
            .populate('registeredVolunteers', 'name profilePicture')
            .populate('attendees','name profilePicture');
        const event2=await Event.findById(req.params.eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Render the event details page and pass the event and user info to the EJS template
        res.render('eventDetails', { event ,user:req.user,event2});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
