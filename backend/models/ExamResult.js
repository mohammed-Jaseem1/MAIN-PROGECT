const mongoose = require('mongoose');

const ExamResultSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String, required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    examTitle: { type: String, required: true },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    answers: [
        {
            questionId: Number,
            selectedOption: Number,
            isCorrect: Boolean
        }
    ],
    aiNotes: { type: String },
    subject: { type: String },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExamResult', ExamResultSchema);
