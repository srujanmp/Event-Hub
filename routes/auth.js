const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();
const User = require('../models/User');
const ClubAdmin = require('../models/ClubAdmin');

require('dotenv').config();

// Hardcoded admin emails
//const allowedAdminEmails = ['srujanmpadmashali@gmail.com', 'mithunmallya97@gmail.com','sumukharaoh05@gmail.com','karthikssalian5@gmail.com','rakshithx09@gmail.com','shreyasrujan1521@gmail.com'];

// Allowed email domains
const allowedDomains = ['nmamit.in'];


const isServerAdmin = (req, res, next) => {
  if (req.user && req.user.email === 'srujanmpadmashali@gmail.com') {
    return next();
  }
  return res.redirect('/');
};



// Function to get the current domain dynamically
const getCurrentDomain = (req) => {
  return process.env.BASE_URL;
}
// Common Google OAuth strategy for both users and admins
// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${getCurrentDomain()}/auth/google/callback`,
  proxy: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const emailDomain = email.split('@')[1];
    const college = emailDomain === 'nmamit.in' ? 'NMAMIT' : 'Other';

    // Check if user is server admin or club admin
    const isServerAdmin = email === 'srujanmpadmashali@gmail.com';
    const isClubAdmin = await ClubAdmin.exists({ email }).then(result => !!result);

    // Unauthorized if not a server admin, club admin, or from allowed domain
    if (!isServerAdmin && !isClubAdmin && !allowedDomains.includes(emailDomain)) {
      return done(null, false, { message: 'Unauthorized: Email domain is not whitelisted.' });
    }

    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      user.isAdmin = isServerAdmin || isClubAdmin; // Update admin status
      await user.save();
      return done(null, user);
    } else {
      // Create new user
      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: email,
        profilePicture: profile.photos[0].value,
        college: college,
        isAdmin: isServerAdmin || isClubAdmin
      });
      await newUser.save();
      return done(null, newUser);
    }
  } catch (err) {
    console.error('Error in Google Strategy:', err);
    return done(err, null);
  }
}));

  

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Login route for both users and admins
router.get('/login', (req, res, next) => {
  const currentDomain = getCurrentDomain(req);
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account',
    callbackURL: `${getCurrentDomain()}/auth/google/callback`
  })(req, res, next);
});

// Google OAuth callback route
router.get('/google/callback', (req, res, next) => {
  const currentDomain = getCurrentDomain(req);
  passport.authenticate('google', {
    failureRedirect: '/',
    failureFlash: true,
    callbackURL: `${getCurrentDomain()}/auth/google/callback`
  })(req, res, next);
}, (req, res) => {
  res.redirect('/dashboard');
});

router.get('/auth/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: '/',
      failureFlash: true // Enable flashing the failure message
    })(req, res, next);
  },
  (req, res) => {
    res.redirect('/dashboard'); // Redirect to the dashboard on success
  }
);


// Logout route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});


// Route to render the "Create Club Admin" form with existing admins
router.get('/admin/create-club-admin', isServerAdmin, async (req, res) => {
  try {
    const clubAdmins = await ClubAdmin.find(); // Fetch all club admins from the database
    res.render('createClubAdmin', { clubAdmins,user:req.user }); // Pass the admins to the view
  } catch (err) {
    console.error('Error fetching club admins:', err);
    res.status(500).send('Server error');
  }
});


// Route to handle form submission and create a new club admin
router.post('/admin/create-club-admin', isServerAdmin, async (req, res) => {
  const { email, clubName, adminName } = req.body;

  try {
    // Save the new club admin to the database
    const clubAdmin = new ClubAdmin({ email, clubName, adminName });
    await clubAdmin.save();
    res.redirect('/auth/admin/create-club-admin'); // Redirect back to dashboard after creation
  } catch (error) {
    console.error('Error creating club admin:', error);
    res.status(500).send('Error creating club admin');
  }
});

// Route to delete a club admin by ID
router.delete('/club-admins/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAdmin = await ClubAdmin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return res.status(404).json({ message: 'Club admin not found' });
    }
    res.json({ message: 'Club admin deleted successfully', deletedAdmin });
  } catch (error) {
    console.error('Error deleting club admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



module.exports = router;
