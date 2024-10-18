const express = require('express');
const router = express.Router();
const EventRequest = require('../models/ReqEvent');

router.get('/eventreq', (req, res) => {
    if (!req.isAuthenticated()) {
      req.flash('error_msg', 'Unauthorized access.');
      return res.redirect('/auth/login');
    }
    res.render('eventReq'); // Render the form
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


module.exports = router;