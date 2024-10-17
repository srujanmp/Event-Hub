const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();
const User = require('../models/User');
require('dotenv').config();

// Hardcoded admin emails
const allowedAdminEmails = ['srujanmpadmashali@gmail.com', 'mithunmallya97@gmail.com','sumukharao@gmail.com'];

// Allowed email domains
const allowedDomains = ['nmamit.in'];

// Function to get the current domain dynamically
const getCurrentDomain = (req) => {
  return process.env.BASE_URL;
}
// Common Google OAuth strategy for both users and admins
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
  
      // ZZZZZZZ - Check if user is not an admin and belongs to the whitelisted domains

      const isAdmin = allowedAdminEmails.includes(email); // Check if the user is an admin
  
      // If not admin, check if the user's domain is whitelisted
      if (!isAdmin && !allowedDomains.includes(emailDomain)) {
        
        return done(null, false, { message: 'Unauthorized: Email domain is not whitelisted.' });
      }
  
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        user.isAdmin = isAdmin; // Update admin status
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
          isAdmin: isAdmin
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

module.exports = router;
