const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// Create a new student
router.post('/', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
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
