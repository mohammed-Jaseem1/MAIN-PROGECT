const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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
app.use('/api/teacher', teacherAuthRoutes);

const studentRoutes = require('./routes/student');
app.use('/api/student', studentRoutes); // Handles /api/student/login

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
