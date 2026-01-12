const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  phone:     { type: String, required: true },
  joiningDate: { type: Date, required: true },
  employeeId:  { type: String, required: true, unique: true },
  subjects:    { type: [String], default: [] },
  qualifications: { type: String, required: true },
  username:   { type: String, required: true, unique: true },
  password:   { type: String, required: true }, // In production, hash passwords!
});

module.exports = mongoose.model('Teacher', TeacherSchema);
