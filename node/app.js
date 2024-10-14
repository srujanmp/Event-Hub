const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const userRoutes = require('./routes/userRoutes'); // Import user routes
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
require('dotenv').config(); // Load environment variables

const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/your_db_name')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Set EJS as the template engine
app.set('view engine', 'ejs');

// Body parser middleware
app.use(express.urlencoded({ extended: false }));

// Express session middleware
app.use(session({
  secret: 'your_secure_secret_key', // Replace with a strong secret
  resave: true,
  saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

  
// Routes
app.get('/', (req, res) => {
  res.render('index'); // Render homepage with login buttons
});

// User and Admin login routes
app.use('/user', userRoutes); // User routes
app.use('/admin', adminRoutes); // Admin routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));
