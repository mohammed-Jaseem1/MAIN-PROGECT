// App.js remains exactly the same as before
import React, { useState } from 'react';
import './style/Questionpaper.css';

function Qestionpapermanagement() {
  const [questions, setQuestions] = useState([
   
  ]);

  const [examDetails, setExamDetails] = useState({
    name: 'Advanced Quantum Mechanics Quiz',
    educationLevel: 'Undergraduate',
    subject: 'Physics',
    date: 'mm/dd/yyyy',
    time: '--:-- --',
    duration: '60',
    totalMarks: '100',
    instructions: 'Enter special instructions for students...'
  });

  return (
    <div className="edu-platform">
      <header className="header">
        <h1>EduPlatform</h1>
      </header>

      <div className="container">
        {/* Left Column - Sidebar */}
        <aside className="section dashboard" style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
          <h2>Menu</h2>
          <div className="sidebar-buttons" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button className="sidebar-btn">Dashboard</button>
            <button className="sidebar-btn">Question Papers</button>
            <button className="sidebar-btn">Assessments</button>
            <button className="sidebar-btn">Students</button>
            <button className="sidebar-btn">Settings</button>
          </div>
        </aside>

        {/* Middle Column */}
        <div className="middle-column">
          {/* Exam Details */}
          <div className="section exam-details">
            <h2>2. Exam Details</h2>
            <div className="form-grid">
              <div className="form-row">
                <label>Exam Name</label>
                <input 
                  type="text" 
                  value={examDetails.name}
                  onChange={(e) => setExamDetails({...examDetails, name: e.target.value})}
                />
              </div>
              
              <div className="form-row two-column">
                <div>
                  <label>Education Level</label>
                  <select value={examDetails.educationLevel}>
                    <option>Undergraduate</option>
                    <option>Graduate</option>
                    <option>High School</option>
                  </select>
                </div>
                <div>
                  <label>Subject</label>
                  <select value={examDetails.subject}>
                    <option>Physics</option>
                    <option>Mathematics</option>
                    <option>Chemistry</option>
                  </select>
                </div>
              </div>

              <div className="form-row three-column">
                <div>
                  <label>Date & Time</label>
                  <div className="datetime-input">
                    <input type="text" value={examDetails.date} placeholder="mm/dd/yyyy" />
                    <input type="text" value={examDetails.time} placeholder="--:-- --" />
                  </div>
                </div>
                <div>
                  <label>Duration (m)</label>
                  <input type="text" value={examDetails.duration} />
                </div>
                <div>
                  <label>Total Marks</label>
                  <input type="text" value={examDetails.totalMarks} />
                </div>
              </div>

              <div className="form-row">
                <label>Instructions</label>
                <textarea 
                  value={examDetails.instructions}
                  onChange={(e) => setExamDetails({...examDetails, instructions: e.target.value})}
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Question Builder */}
          <div className="section question-builder">
            <h2>3. Question Builder</h2>
            <div className="questions-header">
              <span>Total Questions: 05</span>
            </div>
            
            {questions.map((q) => (
              <div key={q.id} className="question-card">
                <div className="question-header">
                  <span className="question-number">Q{q.id}</span>
                  <span className="question-text">{q.text}</span>
                </div>
                
                <div className="options-list">
                  {q.options.map((option, index) => (
                    <div key={index} className="option-item">
                      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                      <span className="option-text">{option}</span>
                    </div>
                  ))}
                </div>

                <div className="question-meta">
                  <div className="meta-item">
                    <span className="meta-label">Marks:</span>
                    <span className="meta-value">{q.marks}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Difficulty:</span>
                    <span className={`difficulty ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                  </div>
                  <div className="tags">
                    {q.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Question */}
            <div className="add-question">
              <h2>4. Add New Question</h2>
              <div className="add-question-box">
                <p>Click to open question editor or drag & drop questions from bank</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Publishing */}
          <div className="section publishing">
            <h2>5. Publishing</h2>
            <div className="publishing-options">
              <button className="btn-publish">Publish Now</button>
              <button className="btn-schedule">Schedule for Later</button>
            </div>
            <div className="status-section">
              <span>Current Status:</span>
              <span className="status-draft">DRAFT</span>
            </div>
          </div>

          {/* Assignment Settings */}
          <div className="section assignment-settings">
            <h2>6. Assignment Settings</h2>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Target Students</label>
                <select>
                  <option>All Students</option>
                  <option>Selected Students</option>
                </select>
              </div>

              <div className="setting-item">
                <label>Visibility Window</label>
                <div className="datetime-row">
                  <span>START</span>
                  <input type="text" value="mm/dd/yyyy" />
                  <input type="text" value="--:-- --" />
                </div>
                <div className="datetime-row">
                  <span>END</span>
                  <input type="text" value="mm/dd/yyyy" />
                  <input type="text" value="--:-- --" />
                </div>
              </div>

              <div className="setting-item">
                <label>Attempt Limits</label>
                <input type="text" placeholder="Enter number" />
              </div>

              <div className="setting-item checkbox">
                <input type="checkbox" id="shuffle" />
                <label htmlFor="shuffle">Shuffle questions for students</label>
              </div>
            </div>
          </div>

          {/* Quiz Summary */}
          <div className="quiz-summary">
            <h3>QUIZ SUMMARY</h3>
            <div className="summary-item">
              <span>Duration</span>
              <span>40 Mins</span>
            </div>
            <div className="summary-item">
              <span>Difficulty</span>
              <span>Medium-Hard</span>
            </div>
            <div className="summary-item">
              <span>Total Points</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Qestionpapermanagement;