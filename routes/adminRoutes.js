const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); // Import Event model
const multer = require('multer');

// Set up storage and file upload handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Folder where event images will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Unique name for the uploaded file
  }
});
const upload = multer({ storage });

// Route to display event creation form
router.get('/create-event', (req, res) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    req.flash('error_msg', 'Unauthorized access.');
    return res.redirect('/auth/login');
  }
  res.render('createEvent'); // Render the form
});

// Route to handle event creation form submission
router.post('/createevent', upload.single('eventImage'), async (req, res) => {
  try {
    const {
      eventName,
      description,
      venue,
      eventStartTime,
      eventEndTime,
      dateOfEvent,
      maxVolunteers,
      maxParticipants,
      registrationEnd,
      clubName
    } = req.body;

    const newEvent = new Event({
      eventName,
      description,
      venue,
      eventStartTime,
      eventEndTime,
      dateOfEvent,
      maxVolunteers,
      maxParticipants,
      registrationEnd,
      clubName,
      eventPoster: req.file ? `uploads/${req.file.filename}` : '',

      creator: req.user._id, // Save creator's ID
    });

    await newEvent.save();
    req.flash('success_msg', 'Event created successfully!');
    res.redirect('/dashboard'); // Redirect after success
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error creating event.');
    res.redirect('/admin/create-event');
  }
});

module.exports = router;
