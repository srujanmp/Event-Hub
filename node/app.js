const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const keys = require('./config/keys');

const app = express();

// EJS
app.set('view engine', 'ejs');

// Express session
app.use(session({
    secret: 'yourSecret',
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Google Strategy setup
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
    callbackURL: keys.googleCallbackURL
}, (accessToken, refreshToken, profile, done) => {
    // Logic to handle user registration/login based on profile info (handle via Mongoose)
    // This could be dynamic for college, event manager, and student roles
    console.log(profile);
    return done(null, profile); // Save profile in session, or create a user in MongoDB
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// Mongoose setup (adjust connection string)
mongoose.connect('mongodb://localhost/yourDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
