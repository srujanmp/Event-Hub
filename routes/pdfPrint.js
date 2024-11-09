const express = require('express');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const User = require('../models/User'); // Assuming User model is in the 'models/User.js'
const Event = require('../models/Event'); // Assuming Event model is in 'models/Event.js'

const router = express.Router();

// Route to generate and download the PDF
router.get('/generate-pdf/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('registeredUsers') // Get registered users
      .populate('registeredVolunteers') // Get volunteering users
      .populate('attendees'); // Get attendees

    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Create a new PDF document
    const doc = new PDFDocument();

    // Pipe the PDF to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${event.eventName}-attendees.pdf"`);
    doc.pipe(res);

    // Add a title
    doc.fontSize(18).text(`${event.eventName} - Registered Users, Volunteers, and Attendees`, { align: 'center' });
    doc.moveDown(2);

    // Registered Users
    doc.fontSize(14).text('Registered Users:', { underline: true });
    event.registeredUsers.forEach(user => {
      doc.text(`${user.name} - ${user.email}`);
    });
    doc.moveDown(1);

    // Volunteering Users
    doc.fontSize(14).text('Volunteering Users:', { underline: true });
    event.registeredVolunteers.forEach(user => {
      doc.text(`${user.name} - ${user.email}`);
    });
    doc.moveDown(1);

    // Attendees
    doc.fontSize(14).text('Attendees:', { underline: true });
    event.attendees.forEach(user => {
      doc.text(`${user.name} - ${user.email}`);
    });

    // Finalize the PDF and send it to the client
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating PDF');
  }
});

module.exports = router;
