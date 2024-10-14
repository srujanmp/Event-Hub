const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();
const User = require('../models/User'); // Assuming you are using the User model for users
require('dotenv').config();

// Configure passport Google strategy for normal users
passport.use('user-google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/user/auth/google/callback` // Update to the user callback URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
      const existingUser = await User.findOne({ googleId: profile.id });
      if (existingUser) {
          return done(null, existingUser);
      }
      const newUser = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value
      });
      await newUser.save();
      return done(null, newUser);
  } catch (err) {
      console.error(err);
      return done(err, null);
  }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
      done(err, user);
  });
});

// User login route
router.get('/login', passport.authenticate('user-google', { scope: ['profile', 'email'] }));

// User Google OAuth callback route
router.get('/auth/google/callback',
  passport.authenticate('user-google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to user dashboard
    res.redirect('/user/dashboard');
  }
);

// User dashboard route
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/user/login');
  }
  res.render('dashboard', { user: req.user });
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
