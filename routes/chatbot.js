const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
const Event = require('../models/Event'); // Import the Event model

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Handle the prompt and generate content
router.post("/generate-response", async (req, res) => {
  const { prompt } = req.body;

  // Get current date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString(); // Local date format (e.g., '11/09/2024')

  // Try to extract event-related queries (optional, for improved prompt)
  let eventDetails = "";
  const lowerCasePrompt = prompt.toLowerCase();

  if (lowerCasePrompt.includes("event") || lowerCasePrompt.includes("volunteer") || lowerCasePrompt.includes("participant")) {
    try {
      const events = await Event.find(); // You can filter events as per the query
      eventDetails = events.map(event => {
        return `Event Name: ${event.eventName}, Description: ${event.description}, Venue: ${event.venue}, Date: ${event.dateOfEvent}`;
      }).join("\n");
    } catch (error) {
      console.log("Error fetching events:", error);
    }
  }

  // Create a more specific prompt for the AI model based on the presence of events
  const aiPrompt = eventDetails 
    ? `${prompt}\nHere are the events:\n${eventDetails}\nCurrent Date: ${formattedDate}` 
    : `${prompt}\nCurrent Date: ${formattedDate}`;

  try {
    const result = await model.generateContent(aiPrompt);
    res.json({ success: true, response: result.response.text() });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;