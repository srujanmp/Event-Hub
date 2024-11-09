const mongoose = require('mongoose');

const clubAdminSchema = new mongoose.Schema({
  email: { type: String, required: true },
  clubName: { type: String, required: true },
  adminName: { type: String, required: true },
});

module.exports = mongoose.model('ClubAdmin', clubAdminSchema);
