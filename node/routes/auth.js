const express = require('express');
const passport = require('passport');
const router = express.Router();

// Routes for College login
router.get('/college', (req, res) => {
    res.render('college_login');
});
router.get('/google/college', passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: 'college'
}));
router.get('/google/college/callback', passport.authenticate('google', {
    failureRedirect: '/auth/college',
    successRedirect: '/dashboard/college'
}));

// Routes for Event Manager login
router.get('/event_manager', (req, res) => {
    res.render('event_manager_login');
});
router.get('/google/event_manager', passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: 'event_manager'
}));
router.get('/google/event_manager/callback', passport.authenticate('google', {
    failureRedirect: '/auth/event_manager',
    successRedirect: '/dashboard/event_manager'
}));

// Routes for Student login
router.get('/student', (req, res) => {
    res.render('student_login');
});
router.get('/google/student', passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: 'student'
}));
router.get('/google/student/callback', passport.authenticate('google', {
    failureRedirect: '/auth/student',
    successRedirect: '/dashboard/student'
}));

module.exports = router;
