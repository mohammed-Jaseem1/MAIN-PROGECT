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

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (uploadedFile) {
      alert(`✅ Uploaded: ${uploadedFile.name}`);
      setShowUploadModal(false);
      setUploadedFile(null);
    }
  };

  return (
    <div className="edu-platform">
      {/* Remove the upper bar (header) */}
      {/* Sidebar with teacher profile at bottom */}
      <div
        style={{
          width: 180,
          background: "#1e293b",
          color: "#fff",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1100,
          display: "flex",
          flexDirection: "column",
          padding: "32px 16px",
          gap: "16px",
          justifyContent: "space-between"
        }}
      >
        <div>
          <div style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "18px" }}>Menu</div>
          <button
            style={{ background: "#1e293b", color: "#fff", border: "none", textAlign: "left", padding: "10px", borderRadius: "6px", cursor: "pointer" }}
            onClick={() => window.location.href = "/teacher-dashboard"}
          >
            Dashboard
          </button>
          <button
            style={{ background: "#1e293b", color: "#fff", border: "none", textAlign: "left", padding: "10px", borderRadius: "6px", cursor: "pointer" }}
            onClick={() => window.location.href = "/previous-papers"}
          >
            Previous Year Question Papers
          </button>
          <button
            style={{ background: "#1e293b", color: "#fff", border: "none", textAlign: "left", padding: "10px", borderRadius: "6px", cursor: "pointer" }}
            onClick={() => window.location.href = "/students"}
          >
            Students
          </button>
        </div>
        {/* Teacher Profile at bottom */}
        <div style={{
          borderTop: "1px solid #334155",
          paddingTop: "18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            marginBottom: 8
          }}>
            {/* Placeholder avatar, replace with image if available */}
            <span role="img" aria-label="teacher">👩‍🏫</span>
          </div>
          <div style={{ fontWeight: "bold", fontSize: "1rem" }}>Teacher Name</div>
          <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>teacher@email.com</div>
        </div>
      </div>

      <div
        className="container"
        style={{
          marginLeft: 220,
          maxWidth: "1700px",
          width: "calc(100% - 220px)",
          padding: "32px 24px",
          display: "flex",
          gap: "32px",
          justifyContent: "center",
        }}
      >
        {/* Upload Modal */}
        {showUploadModal && (
          <div
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                minWidth: "320px",
                maxWidth: "90vw"
              }}
            >
              <h3 style={{ marginBottom: "1rem" }}>Upload Previous Year Question Paper</h3>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ marginBottom: "1rem" }}
              />
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={handleUpload}
                  disabled={!uploadedFile}
                  style={{
                    background: "#1959b3",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: uploadedFile ? "pointer" : "not-allowed"
                  }}
                >
                  Upload
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFile(null);
                  }}
                  style={{
                    background: "#eee",
                    color: "#333",
                    border: "none",
                    padding: "0.5rem 1.5rem",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
              {uploadedFile && (
                <div style={{ marginTop: "1rem", fontSize: "0.95rem", color: "#1959b3" }}>
                  Selected: {uploadedFile.name}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Middle Column */}
        <div className="middle-column" style={{ flex: 2, minWidth: 0, maxWidth: "700px" }}>
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
        <div className="right-column" style={{ flex: 1, minWidth: 0, maxWidth: "500px" }}>
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