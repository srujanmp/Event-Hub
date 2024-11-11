const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
const Event = require('../models/Event'); // Import the Event model

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Handle the prompt and generate content
router.post("/generate-response", async (req, res) => {
  if (!req.isAuthenticated()) {
    req.flash('success_msg', 'You are logged out');
    
    return res.redirect('/auth/login');
}
  const { prompt } = req.body;

  // Get current date and time
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString(); // Local date format (e.g., '11/09/2024')

  // Try to extract event-related queries (optional, for improved prompt)
  let eventDetails = "";
  const lowerCasePrompt = prompt.toLowerCase();

    try {
      const events = await Event.find(); // You can filter events as per the query
      eventDetails = events.map(event => {
        return `Event Name: ${event.eventName}, Description: ${event.description}, Venue: ${event.venue}, Date: ${event.dateOfEvent}`;
      }).join("\n");
    } catch (error) {
      console.log("Error fetching events:", error);
    }
  



  // Create a more specific prompt for the AI model based on the presence of events
  // const aiPrompt = eventDetails ? `here is the prompt:{${prompt} event event \n }and Here are the events {\n${eventDetails}\n} and Current Date is { ${formattedDate}} , answer the prompt based on given event and also format the answer asif u are a chatbot` : `${prompt}\nCurrent Date: ${formattedDate}`;
  const aiPrompt = `User question :${prompt} ,,,Here are the relevant events for your query:\n${eventDetails}\n**Current Date:** ${formattedDate}\nAs a helpful chatbot, answer the user's question about the events in a clear and short paragraph. **User Info:${req.user}**  **(Asking about events)**\n`;

  try {
    const result = await model.generateContent(aiPrompt);
    res.json({ success: true, response: result.response.text() });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;
