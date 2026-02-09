const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  target: {
    type: String,
    enum: ['student', 'teacher'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
