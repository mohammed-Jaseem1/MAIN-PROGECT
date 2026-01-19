const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    unique: true
  },
  edu_level: {
    type: String,
    enum: ['10th', '12th', 'degree'],
    required: true
  },
  account_status: {
    type: Boolean,
    default: true
  },
  full_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
