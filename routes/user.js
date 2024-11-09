// routes/user.js
const express = require('express');
const router = express.Router();

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login'); // Redirect to login if not authenticated
}

// Profile route
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.user }); // Pass the current user to the profile view
});

module.exports = router;
