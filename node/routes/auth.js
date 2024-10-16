const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();
const User = require('../models/User');
require('dotenv').config();

// Hardcoded admin emails
const allowedAdminEmails = ['srujanmpadmashali@gmail.com', 'admin2@gmail.com'];

// Allowed email domains
const allowedDomains = ['@nmamit.in'];

// Function to get the current domain dynamically
const getCurrentDomain = (req) => {
  return process.env.BASE_URL;
};

// Common Google OAuth strategy for both users and admins
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
  proxy: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const emailDomain = email.split('@')[1];
    const college = emailDomain === 'nmamit.in' ? 'NMAMIT' : 'Other';
    
    // Check if the user is an admin
    const isAdmin = allowedAdminEmails.includes(email);

    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      user.isAdmin = isAdmin; // Update admin status
      await user.save();
      return done(null, user);
    } else {
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
    callbackURL: `${currentDomain}/auth/google/callback`
  })(req, res, next);
});

// Google OAuth callback route
router.get('/auth/google/callback', (req, res, next) => {
  const currentDomain = getCurrentDomain(req);
  passport.authenticate('google', {
    failureRedirect: '/',
    failureFlash: true,
    callbackURL: `${currentDomain}/auth/google/callback`
  })(req, res, next);
}, (req, res) => {
  res.redirect('/dashboard');
});

// Dashboard route with admin flag
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login');
  }
  res.render('dashboard', { user: req.user });
});

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });
});

module.exports = router;
