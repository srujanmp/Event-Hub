const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false, // Default value is false, meaning the user is not an admin unless explicitly set.
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
