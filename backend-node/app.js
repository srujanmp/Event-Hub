// backend-node/app.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// MongoDB connection
const mongoURL = 'mongodb://mongo:27017/mydatabase'; // Points to the MongoDB container
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Simple route
app.get('/', (req, res) => {
  res.send('Hello from Node.js!');
});

// Start the server
app.listen(3000, () => {
  console.log('Node.js server is running on port 3000');
});
