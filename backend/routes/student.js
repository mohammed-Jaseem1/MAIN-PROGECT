const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { sendWelcomeEmail } = require('../utils/emailService');

// Create a new student and send welcome email
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();

    // Send welcome email with credentials (non-blocking – don't fail registration if email fails)
    try {
      await sendWelcomeEmail({
        full_name: student.full_name,
        email: student.email,
        password: req.body.password, // plain-text password before any hashing
        student_id: student.student_id,
      });
      console.log(`[Student] ✅ Account created & welcome email sent to ${student.email}`);
    } catch (emailErr) {
      console.error(`[Student] ❌ Welcome email FAILED for ${student.email}`);
      console.error(`[Student] 📛 Reason: ${emailErr.message}`);
      console.error(`[Student] 🔍 Code: ${emailErr.code || 'N/A'} | Response: ${emailErr.response || 'N/A'}`);
      // Return success with a warning so the UI can inform the admin
      return res.status(201).json({
        ...student.toObject(),
        emailWarning: 'Student created, but welcome email could not be sent. Check your email settings.',
      });
    }

    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    // Replace with proper password check if hashed
    if (student.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.json({ message: 'Login successful', student });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
