const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const { sendTeacherWelcomeEmail } = require('../utils/emailService');

// GET all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /add  — create teacher and send welcome email
router.post('/add', async (req, res) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();

    // Send welcome email (non-blocking — don't fail registration if email fails)
    try {
      await sendTeacherWelcomeEmail({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,   // plain-text before any hashing
        employeeId: req.body.employeeId,
      });
      console.log(`[Teacher] ✅ Account created & welcome email sent to ${req.body.email}`);
      res.status(201).json({ message: 'Teacher added successfully and welcome email sent.' });
    } catch (emailErr) {
      console.error(`[Teacher] ❌ Welcome email FAILED for ${req.body.email}: ${emailErr.message}`);
      // Still respond success but warn the frontend
      res.status(201).json({
        message: 'Teacher added successfully.',
        emailWarning: 'Teacher created, but welcome email could not be sent. Check your email settings.',
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
