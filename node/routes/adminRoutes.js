const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();
const User = require('../models/User'); // Assuming you are using the User model for admins as well
require('dotenv').config();

// Hardcoded admin emails
const allowedAdminEmails = ['srujanmpadmashali@gmail.com', 'admin2@gmail.com'];

// Configure passport Google strategy for admins
passport.use('admin-google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/admin/auth/google/callback` // Update to the admin callback URL
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;

  // Check if the email is in the allowed admin emails list
  if (!allowedAdminEmails.includes(email)) {
    return done(null, false, { message: 'Unauthorized access: Admins only.' });
  }

  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      return done(null, user);
    } else {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: email,
        profilePicture: profile.photos[0].value,
      });
      await user.save();
      return done(null, user);
    }
  } catch (err) {
    console.error(err);
    return done(err, false);
  }
}));

// Admin login route
router.get('/login', passport.authenticate('admin-google', { scope: ['profile', 'email'] }));

// Admin Google OAuth callback route
router.get('/auth/google/callback',
  passport.authenticate('admin-google', { failureRedirect: '/admin/login' }),
  (req, res) => {
    // Successful authentication, redirect to admin dashboard
    res.redirect('/admin/dashboard');
  }
);

// Admin dashboard route with email check
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/admin/login');
  }

  const email = req.user.email;

  // Check if the email is in the allowed admin emails list
  if (!allowedAdminEmails.includes(email)) {
    req.logout();
    req.flash('error_msg', 'Unauthorized access: Admins only.');
    return res.redirect('/admin/login');
  }

  res.render('adminDashboard', { user: req.user });
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });
});

module.exports = router;
