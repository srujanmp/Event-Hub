const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema({
  eventName: String,
  description: String,
  venue: String,
  time: String,
  eventStartTime: String,
  eventEndTime: String,
  dateOfEvent: Date,
  maxVolunteers: Number,
  maxParticipants: Number,
  registrationEnd: Date,
  clubName: String,
  eventPoster: String,
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  registeredUsers: [{ type: Schema.Types.ObjectId, ref: 'User', default: 0 }],
  registeredVolunteers: [{ type: Schema.Types.ObjectId, ref: 'User', default: 0 }],
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }]  // New field for attendance
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
