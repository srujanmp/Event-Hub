const express = require('express');
const QRCode = require('qrcode');
const router = express.Router();
const Event = require('../models/Event');

// Admin scans QR code and marks attendance for the user
router.get('/admin/attendance/:eventId', (req, res) => {
    res.render('scan_qrcode', { eventId: req.params.eventId });
});

router.post('/admin/attendance/:eventId', async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        const userId = req.body.userId;  // Extracted from the scanned QR code

        // Check if the user is already marked as attending
        if (!event.attendees.includes(userId)) {
            event.attendees.push(userId);
            await event.save();
            res.json({ success: true, message: 'Attendance marked successfully.' });
        } else {
            res.json({ success: false, message: 'User already marked as attended.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.get('/admin/mark-attendance/:userId/:eventId', async (req, res) => {
    try {
        const { eventId, userId } = req.params;

        // Find the event by ID
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Check if the user is registered for the event (as a participant or volunteer)
        const isRegistered = event.registeredUsers.includes(userId) || event.registeredVolunteers.includes(userId);

        if (!isRegistered) {
            return res.status(403).send('User is not registered for this event.');
        }

        // Check if the user is already marked as attended
        if (event.attendees.some(attendee => attendee.equals(userId))) {
            return res.redirect(`/admin/attendance/${eventId}?message=already_marked`);
        }

        // Mark the user as attended
        event.attendees.push(userId);
        await event.save();

        return res.redirect(`/admin/attendance/${eventId}?message=attendance_marked`);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Server error');
    }
});



// User QR Code display for the specific event
router.get('/attendance/:eventId', async (req, res) => {
    try {
        const userId = req.user._id;
        const eventId = req.params.eventId;

        // Generate QR code with the user's ID and the eventId
        const qrCode = await QRCode.toDataURL(userId.toString());

        res.render('attendance', { qrCode, user: req.user, eventId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


module.exports = router;
