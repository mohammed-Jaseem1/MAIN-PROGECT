const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
    title: { type: String, required: true },
    educationLevel: { type: String },
    subject: { type: String },
    date: { type: String },
    time: { type: String },
    duration: { type: String },
    totalMarks: { type: String },
    instructions: { type: String },
    questions: [
        {
            id: Number,
            text: String,
            options: [String],
            correctAnswer: Number, // Index of the correct option (0-3)
            marks: String,
            difficulty: String,
            tags: [String]
        }
    ],
    status: { type: String, default: 'PUBLISHED' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', ExamSchema);
