const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); // Import Event model
const multer = require('multer'); // (no longer needed)
const cloudinary = require('cloudinary').v2; // Import Cloudinary v2





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


// Configure Cloudinary with your credentials (replace placeholders)
cloudinary.config({
  cloud_name: 'dgw9n3zt9',
  api_key: '279138198381885',
  api_secret: 'bwUDkG2zgQGBGP2_C9r7_NhthIU'
});

// Route to display event creation form
router.get('/create-event', (req, res) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    req.flash('error_msg', 'Unauthorized access.');
    return res.redirect('/auth/login');
  }
  res.render('createEvent', { user: req.user }); // Render the form
});

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
      clubName,
      googleFormLink
    } = req.body;

    let eventPosterUrl = '';

    // Upload image to Cloudinary with transformations
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          transformation: {
            width: 500, // Resize to 500px width
            quality: 100, // Compress to 35% quality
            fetch_format: 'auto' // Automatically select optimal format
          }
        });
        eventPosterUrl = result.secure_url; // Store the Cloudinary URL
        console.log(eventPosterUrl);
      } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        req.flash('error_msg', 'Error uploading event image.');
        return res.redirect('/admin/create-event');
      }
    }

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
      eventPoster: eventPosterUrl, // Store the Cloudinary URL or an empty string
      googleFormLink,
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



router.post('/deleteevent/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Find the event by ID and check if the user is the creator or an admin
    const event = await Event.findById(eventId);

    if (!event) {
      req.flash('error_msg', 'Event not found.');
      return res.redirect('/dashboard');
    }

    if (req.user._id.toString() === event.creator.toString()||req.user.email==="srujanmpadmashali@gmail.com") {
      await Event.findByIdAndDelete(eventId);
      req.flash('success_msg', 'Event deleted successfully.');
    } else {
      req.flash('error_msg', 'Unauthorized action.');
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error deleting event.');
    res.redirect('/dashboard');
  }
});





module.exports = router;
