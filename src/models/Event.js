const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  customerId:String,
  date: Date,
  // Add other fields as needed
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
