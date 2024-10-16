const express = require('express');
const router = express.Router();

// Dashboard route with admin flag
router.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('success_msg', 'You are logged out');
        
        return res.redirect('/auth/login');
    }

    // Pass the isAdmin flag from the user object to the template
    const isAdmin = req.user.isAdmin || false; // Default to false if not set
    res.render('dashboard', { user: req.user, isAdmin: isAdmin });
});

module.exports = router;
