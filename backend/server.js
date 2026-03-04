const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const Groq = require('groq-sdk');

const multer = require('multer');
const Paper = require('./models/Paper');
const Teacher = require('./models/Teacher');
const Notification = require('./models/Notification');
const Exam = require('./models/Exam');
const ExamResult = require('./models/ExamResult');
const Chat = require('./models/Chat');
const notificationRoutes = require('./routes/notification');
const chatRoutes = require('./routes/chat');

// AI-driven Performance Analysis using Gemini
const generateAINotes = async (processedAnswers, examQuestions, studentName, examTitle) => {
  try {
    const subjectAnalysis = {};
    const questionReviewData = [];

    processedAnswers.forEach((ans, index) => {
      const q = examQuestions.find(eq => eq.id === Number(ans.questionId));
      if (!q) return;

      const subject = (q.tags && q.tags.length > 0) ? q.tags[0] : "General";
      if (!subjectAnalysis[subject]) {
        subjectAnalysis[subject] = { correct: 0, total: 0, weakQuestions: [] };
      }

      subjectAnalysis[subject].total++;
      if (ans.isCorrect) {
        subjectAnalysis[subject].correct++;
      } else {
        subjectAnalysis[subject].weakQuestions.push({
          text: q.text,
          topic: q.tags[1] || "General Concept"
        });
      }

      // Prepare detailed data for AI to provide conceptual explanation
      questionReviewData.push({
        num: index + 1,
        question: q.text,
        studentSelected: q.options[ans.selectedOption] || "No answer",
        correctChoice: q.options[q.correctAnswer],
        isCorrect: ans.isCorrect,
        subject: subject,
        topic: q.tags?.[1] || "General"
      });
    });

    const performanceSummary = Object.entries(subjectAnalysis).map(([name, stats]) => ({
      subject: name,
      score: `${stats.correct}/${stats.total}`,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }));

    const prompt = `
      You are an expert academic mentor. Student: ${studentName}. Exam: "${examTitle}".
      
      OVERALL PERFORMANCE:
      ${JSON.stringify(performanceSummary, null, 2)}
      
      DETAILED QUESTION-BY-QUESTION RESULTS:
      ${JSON.stringify(questionReviewData, null, 2)}

      TASK: Create a comprehensive "Personalized Learning & Understanding Guide".
      
      REQUIRED STRUCTURE:
      1. # 🎓 Subject Mastery Guide for ${studentName}
      2. ## 📊 Quick Performance Overview
         Summarize the key strengths and areas needing improvement.
      3. ## 🧠 The "Understanding" Vault (Question Review)
         For EACH question the student answered incorrectly (or all questions if preferred for completeness):
         ### Q[Number]: [Question Text]
         - **Status**: [✅ Correct / ❌ Incorrect]
         - **Your Choice**: [Student's Answer]
         - **Correct Answer**: [Correct Answer]
         - **Conceptual Explanation**: Provide a clear, detailed 2-3 sentence explanation of WHY the correct answer is right. Explain the underlying rule or fact so the student truly UNDERSTANDS, not just memorizes.
      4. ## 📘 Deep-Dive Subject Notes
         For the 2 subjects with the lowest scores, provide high-quality educational notes (2-3 paragraphs each) explaining the core principles.
      5. ## 🎯 Immediate Study Mission
         Define one specific 45-minute activity to master the weak points identified today.
      
      TONE: Professional, encouraging, and deeply educational.
    `;

    // Try Groq First
    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const chat = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.3-70b-versatile",
        });
        if (chat.choices[0]?.message?.content) return chat.choices[0].message.content;
      } catch (e) { console.warn("Groq failed, trying Gemini..."); }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt
      });
      return response.text;
    } catch (genError) {
      console.error("Gemini failed:", genError);
      throw genError;
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Manual Fallback
    let manual = `# 🎓 personalized Study Path (Manual Review)\n\n## 📊 Question Breakdown\n`;
    processedAnswers.forEach((ans, idx) => {
      const q = examQuestions.find(eq => eq.id === Number(ans.questionId));
      if (q) {
        manual += `### Q${idx + 1}: ${q.text}\n- Status: ${ans.isCorrect ? '✅' : '❌'}\n- Correct: ${q.options[q.correctAnswer]}\n\n`;
      }
    });
    return manual;
  }
};

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
app.use('/api/chats', chatRoutes);

const PORT = process.env.PORT || 5000;

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

// Published Exam routes
app.post('/api/exams', async (req, res) => {
  try {
    const examData = req.body;
    const exam = new Exam(examData);
    await exam.save();

    // Create notification for students
    const notification = new Notification({
      target: 'student',
      level: exam.educationLevel,
      title: 'New Exam Published',
      body: `A new exam "${exam.title}" has been published for ${exam.educationLevel} students.`
    });
    await notification.save();

    res.status(201).json({ message: 'Exam published successfully', exam });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish exam', details: err.message });
  }
});

app.get('/api/exams', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exams', details: err.message });
  }
});

// Submit Exam Attempt
app.post('/api/exams/submit', async (req, res) => {
  try {
    const { studentId, studentName, examId, answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    let score = 0;
    const processedAnswers = answers.map(ans => {
      const question = exam.questions.find(q => q.id === Number(ans.questionId));
      const isCorrect = question && Number(question.correctAnswer) === Number(ans.selectedOption);
      if (isCorrect) score += Number(question.marks || 1);
      return {
        ...ans,
        isCorrect
      };
    });

    const aiNotes = await generateAINotes(processedAnswers, exam.questions, studentName, exam.title);

    const result = new ExamResult({
      studentId,
      studentName,
      examId,
      examTitle: exam.title,
      score,
      totalMarks: parseInt(exam.totalMarks || 0),
      answers: processedAnswers,
      aiNotes,
      subject: exam.subject || "General"
    });

    await result.save();
    res.status(201).json({
      message: 'Exam submitted successfully',
      score,
      totalMarks: exam.totalMarks,
      aiNotes
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit exam', details: err.message });
  }
});

// Get all exam results (for teacher)
app.get('/api/exams/results', async (req, res) => {
  try {
    const results = await ExamResult.find().sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results', details: err.message });
  }
});

// Get results for specific student
app.get('/api/student/results/:studentId', async (req, res) => {
  try {
    const results = await ExamResult.find({ studentId: req.params.studentId }).sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student results', details: err.message });
  }
});

// NEW: Aggregated Weak Points Analysis for Student
// AI Question Generation endpoint
const generateAIQuestions = async (count, level, references) => {
  try {
    const prompt = `
      You are an expert exam paper creator for ${level} level exams.
      TASK: Generate ${count} multiple-choice questions (MCQs) for an exam.
      
      CONTEXT/REFERENCES: 
      The questions should be inspired by or similar to the following previous year papers/topics:
      ${references.join(', ')}
      
      OUTPUT FORMAT:
      You MUST return a valid JSON array of objects. Each object MUST have this structure:
      {
        "text": "The question text here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0, // index of the correct option (0-3)
        "marks": "1",
        "difficulty": "Easy", // Easy, Medium, or Hard
        "tags": ["Subject", "Topic", "${level}"]
      }
      
      REQUIREMENTS:
      1. Ensure a mix of subjects (History, Geography, Polity, Science, etc.) if applicable to the level.
      2. Vary the difficulty across the ${count} questions.
      3. The JSON must be strictly valid and contain exactly ${count} questions.
      4. Do not include any text other than the JSON array.
    `;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", text);
      // Fallback: try to find the JSON array in the text if it returned extra fluff
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      throw parseError;
    }
  } catch (error) {
    console.error("Error generating AI questions:", error);
    throw error;
  }
};

app.post('/api/generate-questions', async (req, res) => {
  try {
    const { count, level, references } = req.body;
    if (!count || !level) {
      return res.status(400).json({ error: 'Count and level are required' });
    }

    // Cap count to avoid long timeouts/costs (e.g. max 50 at a time for AI)
    // If user wants 100, we might need to handle it in batches or just warn them.
    // For now, let's allow up to 100 but mention it might take time.
    const questions = await generateAIQuestions(count, level, references || []);

    // Assign IDs to questions since the AI might not know the exact order or starting ID
    const questionsWithIds = questions.map((q, index) => ({
      ...q,
      id: index + 1
    }));

    res.json(questionsWithIds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate questions', details: err.message });
  }
});

app.get('/api/student/analysis/:studentId', async (req, res) => {
  try {
    const results = await ExamResult.find({ studentId: req.params.studentId });

    const subjectStats = {};
    const weakTopics = [];

    results.forEach(res => {
      res.answers.forEach(ans => {
        // We might need to fetch the exam to get subject/tags if not stored in answer
        // But for now let's hope it's stored or we can infer it.
        // Actually, ExamResult stores answers but maybe not the subject per answer.
        // Let's assume we can at least aggregate by exam title for now, 
        // or if answers have some metadata.
      });

      // Let's use the aiNotes content if we can't get structured data, 
      // or just count scores per exam.
      const subject = "General"; // Default
      if (!subjectStats[subject]) subjectStats[subject] = { score: 0, total: 0, count: 0 };
      subjectStats[subject].score += res.score;
      subjectStats[subject].total += res.totalMarks;
      subjectStats[subject].count++;
    });

    res.json({
      subjectStats,
      totalExams: results.length,
      recentPerformance: results.slice(0, 5).map(r => ({ title: r.examTitle, score: r.score, total: r.totalMarks }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

// Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, chatId } = req.body;
    const prompt = message;
    let aiReply = '';

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const chat = await groq.chat.completions.create({
          messages: [
            ...history.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            { role: "user", content: prompt }
          ],
          model: "llama-3.3-70b-versatile",
        });
        if (chat.choices[0]?.message?.content) {
          aiReply = chat.choices[0].message.content;
        }
      } catch (e) {
        console.warn("Groq failed in chat, trying Gemini...");
      }
    }

    if (!aiReply) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            ...history.map(msg => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }]
            })),
            { role: 'user', parts: [{ text: prompt }] }
          ]
        });
        aiReply = response.text;
      } catch (genError) {
        console.error("Gemini failed in chat:", genError);
        return res.status(500).json({ error: 'AI Error', details: genError.message });
      }
    }

    // Persist to database if chatId is provided
    if (chatId && aiReply) {
      try {
        const chat = await Chat.findById(chatId);
        if (chat) {
          chat.messages.push({ role: 'user', content: message });
          chat.messages.push({ role: 'assistant', content: aiReply });
          chat.updatedAt = Date.now();
          if (chat.title === 'New Chat') {
            chat.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
          }
          await chat.save();
        }
      } catch (dbErr) {
        console.error("Failed to save chat to DB:", dbErr);
      }
    }

    res.json({ reply: aiReply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
