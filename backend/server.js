const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const multer = require('multer');
const Paper = require('./models/Paper');
const Teacher = require('./models/Teacher'); // Add this line to import the Teacher model


const Notification = require('./models/Notification');
const notificationRoutes = require('./routes/notification');

const app = express();
app.use(express.json());
app.use(cors());

// Use your local MongoDB connection string
const mongoURI = "mongodb://127.0.0.1:27017/Psc";

mongoose.connect(mongoURI)
  .then(() => console.log('Connected!'))
  .catch(err => console.log('err', err));

// Example route
app.get('/', (req, res) => {
  res.send('Backend is running');
});


const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const teacherRoutes = require('./routes/teacher');
app.use('/api/teacher', teacherRoutes);

const teacherAuthRoutes = require('./routes/teacherAuth');
app.use('/api/teacher-auth', teacherAuthRoutes); // Changed base path

const studentRoutes = require('./routes/student');
app.use('/api/student', studentRoutes); // Handles /api/student/login

// Notification routes
app.use('/api/notifications', notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// File upload endpoint
const upload = multer();
app.post('/api/upload-paper', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { originalname, mimetype, buffer } = req.file;
    const { title, year, level } = req.body;
    const paper = new Paper({
      title,
      year,
      level,
      filename: originalname,
      mimetype,
      file: buffer
    });
    await paper.save();
    res.json({ message: 'File uploaded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

// Get all papers endpoint
app.get('/api/papers', async (req, res) => {
  try {
    const papers = await Paper.find({}, '-file').sort({ uploadedAt: -1 }); // Exclude file buffer
    res.json(papers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch papers', details: err.message });
  }
});

// Delete paper endpoint
app.delete('/api/papers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Paper.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Paper not found' });
    }
    res.json({ message: 'Paper deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete paper', details: err.message });
  }
});

// Serve file for a paper by ID
app.get('/api/papers/:id/file', async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper || !paper.file) return res.status(404).send('File not found');
    res.set('Content-Type', paper.mimetype);
    res.set('Content-Disposition', `inline; filename="${paper.filename}"`);
    res.send(paper.file);
  } catch (err) {
    res.status(500).send('Error retrieving file');
  }
});

// Add endpoint to get total teacher count
app.get('/api/teacher/count', async (req, res) => {
  try {
    const count = await Teacher.countDocuments();
    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teacher count', details: err.message });
  }
});

// Add endpoint to get active teacher count
app.get('/api/teacher/active-count', async (req, res) => {
  try {
    const count = await Teacher.countDocuments({
      $or: [
        { status: { $regex: '^ACTIVE$', $options: 'i' } }, // case-insensitive match
        { status: { $exists: false } }, // treat missing status as active (optional)
        { status: null } // treat null status as active (optional)
      ]
    });
    res.json({ active: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active teacher count', details: err.message });
  }
});
