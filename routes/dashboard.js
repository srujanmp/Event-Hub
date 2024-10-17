const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
// Dashboard route with admin flag

router.get('/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('success_msg', 'You are logged out');
        
        return res.redirect('/auth/login');
    }
    try {
      const events = await Event.find(); // Fetch all events
      res.render('dashboard', { events ,user:req.user }); // Pass events to the dashboard view
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error fetching events.');
      res.redirect('/');
    }
  });

module.exports = router;
