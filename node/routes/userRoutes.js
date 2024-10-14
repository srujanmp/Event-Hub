const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const router = express.Router();
const User = require('../models/User');
require('dotenv').config();

// Allowed email domains
const allowedDomains = ['@nmamit.in'];

// Function to get the current domain dynamically
const getCurrentDomain = (req) => {
  return `https://zany-pancake-pqp699x5vwqcwv-5000.app.github.dev`;
};

passport.use('user-google', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/user/auth/google/callback',
  proxy: true
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const domain = email.substring(email.lastIndexOf("@"));
    
    if (!allowedDomains.includes(domain)) {
      return done(null, false, { message: 'Unauthorized email domain.' });
    }

    // console.log('Profile:', profile);
    const existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }
    const newUser = new User({
      googleId: profile.id,
      displayName: profile.displayName,
      email: email,
      profilePicture: profile.photos[0].value
    });
    await newUser.save();
    return done(null, newUser);
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

router.get('/login', (req, res, next) => {
  const currentDomain = getCurrentDomain(req);
  console.log('Login route accessed');
  // console.log('Current domain:', currentDomain);
  passport.authenticate('user-google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account',
    callbackURL: `${currentDomain}/user/auth/google/callback`
  })(req, res, next);
});

router.get('/auth/google/callback',
  (req, res, next) => {
    const currentDomain = getCurrentDomain(req);
    passport.authenticate('user-google', { 
      failureRedirect: '/',
      failureFlash: true,
      callbackURL: `${currentDomain}/user/auth/google/callback`
    })(req, res, next);
  },
  (req, res) => {
    console.log('Authentication successful');
    res.redirect('/user/dashboard');
  }
);

router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/user/login');
  }
  res.render('dashboard', { user: req.user });
});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
  });
});

module.exports = router;