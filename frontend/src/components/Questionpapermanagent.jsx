import React, { useState, useEffect, useRef } from 'react';
import './style/Questionpaper.css';

function Qestionpapermanagement() {
  const [questions, setQuestions] = useState([]);

  const [previousPapers, setPreviousPapers] = useState([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState([]);

  const [examDetails, setExamDetails] = useState({
    name: '',
    educationLevel: '',
    totalMarks: '',
    instructions: ''
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePaper = (id) => {
    setSelectedPaperIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/papers')
      .then(res => res.json())
      .then(data => setPreviousPapers(data))
      .catch(err => console.error('Error fetching papers:', err));
  }, []);

  // Update Exam Details when a Previous Paper is selected
  useEffect(() => {
    if (selectedPaperIds.length > 0) {
      const selectedOnes = previousPapers.filter(p => selectedPaperIds.includes(p._id));
      if (selectedOnes.length > 0) {
        setExamDetails(prev => ({
          ...prev,
          name: selectedOnes.length === 1
            ? `Modified: ${selectedOnes[0].title} (${selectedOnes[0].year})`
            : `Combined Exam: ${selectedOnes.map(p => p.year).join('/')}`,
          educationLevel: selectedOnes[0].level || prev.educationLevel,
          instructions: `This paper is generated based on the structure of ${selectedOnes.length} selected reference exam(s). Please follow all standard instructions.`
        }));
      }
    }
  }, [selectedPaperIds, previousPapers]);

  // Auto-calculate Total Marks when questions change
  useEffect(() => {
    const total = questions.reduce((sum, q) => sum + parseInt(q.marks || 0), 0);
    setExamDetails(prev => ({ ...prev, totalMarks: total.toString() }));
  }, [questions]);

  const handleUpload = () => {
    if (uploadedFile) {
      alert(`✅ Uploaded: ${uploadedFile.name}`);
      setShowUploadModal(false);
      setUploadedFile(null);
    }
  };



  const handlePublish = async () => {
    if (questions.length === 0) {
      alert("Please add some questions before publishing.");
      return;
    }

    const examData = {
      title: examDetails.name,
      educationLevel: examDetails.educationLevel,
      totalMarks: examDetails.totalMarks,
      instructions: examDetails.instructions,
      questions: questions
    };

    try {
      const response = await fetch('http://localhost:5000/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
      });

      if (response.ok) {
        alert("🚀 Exam published successfully and notified to students!");
      } else {
        alert("❌ Failed to publish exam.");
      }
    } catch (err) {
      console.error("Publish error:", err);
      alert("❌ Error publishing exam.");
    }
  };

  const addQuestion = () => {
    const newId = questions.length + 1;
    const newQ = {
      id: newId,
      text: "New Question Text?",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: 0,
      marks: "1",
      difficulty: "Medium",
      tags: ["General"]
    };
    setQuestions([...questions, newQ]);
  };

  const generateAIQuestions = async (count) => {
    if (!examDetails.educationLevel) {
      alert("Please select an Education Level first.");
      return;
    }

    if (selectedPaperIds.length === 0) {
      if (!window.confirm(`No previous papers selected. Generate a standard ${count}-question exam for ${examDetails.educationLevel} instead?`)) return;
    }

    const selectedOnes = previousPapers.filter(p => selectedPaperIds.includes(p._id));
    const paperTitles = selectedOnes.map(p => p.title.replace(/\.[^/.]+$/, ""));

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count,
          level: examDetails.educationLevel,
          references: paperTitles
        })
      });

      if (!response.ok) throw new Error("Failed to generate questions");

      const aiQuestions = await response.json();
      setQuestions(aiQuestions);
      alert(`✅ Successfully generated ${aiQuestions.length} AI-powered questions!`);
    } catch (err) {
      console.error("AI Generation error:", err);
      alert("❌ Error generating AI questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFullExam = () => generateAIQuestions(100);
  const generate20Questions = () => generateAIQuestions(20);

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
            <h2>1. Select Previous Year Papers (Reference Pool)</h2>
            <div className="multi-select-container" ref={dropdownRef}>
              <div
                className={`dropdown-selector ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="selected-tags">
                  {selectedPaperIds.length === 0 ? (
                    <span className="placeholder">Choose papers for reference...</span>
                  ) : (
                    selectedPaperIds.map(id => {
                      const paper = previousPapers.find(p => p._id === id);
                      return paper ? (
                        <div key={id} className="paper-chip">
                          <span>{paper.year} - {paper.level}</span>
                          <button
                            className="remove-chip"
                            onClick={(e) => { e.stopPropagation(); togglePaper(id); }}
                          >
                            &times;
                          </button>
                        </div>
                      ) : null;
                    })
                  )}
                </div>
                <div className="dropdown-arrow">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="dropdown-list-container">
                  <div className="dropdown-list-header">
                    <span>Available Question Papers</span>
                    {selectedPaperIds.length > 0 && (
                      <button className="clear-all" onClick={() => setSelectedPaperIds([])}>Clear All</button>
                    )}
                  </div>
                  <div className="dropdown-options-list">
                    {previousPapers.length === 0 ? (
                      <div className="no-options">No papers available</div>
                    ) : (
                      previousPapers.map(paper => (
                        <div
                          key={paper._id}
                          className={`dropdown-option ${selectedPaperIds.includes(paper._id) ? 'selected' : ''}`}
                          onClick={() => togglePaper(paper._id)}
                        >
                          <div className="option-checkbox">
                            {selectedPaperIds.includes(paper._id) && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className="option-info">
                            <span className="option-title">{paper.title}</span>
                            <span className="option-meta">{paper.year} • {paper.level}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>


            <h2>2. Exam Details</h2>
            <div className="form-grid">
              <div className="form-row">
                <label>Exam Name</label>
                <input
                  type="text"
                  value={examDetails.name}
                  onChange={(e) => setExamDetails({ ...examDetails, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Education Level</label>
                <select
                  value={examDetails.educationLevel}
                  onChange={(e) => setExamDetails({ ...examDetails, educationLevel: e.target.value })}
                >
                  <option value="">-- Select Level --</option>
                  <option>10th</option>
                  <option>12th</option>
                  <option>degree</option>
                </select>
              </div>

              <div className="form-row">
                <label>Total Marks</label>
                <input
                  type="text"
                  value={examDetails.totalMarks}
                  readOnly
                  style={{ background: '#f1f5f9', fontWeight: 'bold' }}
                />
              </div>

              <div className="form-row">
                <label>Instructions</label>
                <textarea
                  value={examDetails.instructions}
                  onChange={(e) => setExamDetails({ ...examDetails, instructions: e.target.value })}
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Question Builder */}
          <div className="section question-builder">
            <h2>3. Question Builder</h2>
            <div className="questions-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Total Questions: {questions.length}</span>
            </div>

            {Object.entries(
              questions.reduce((acc, q) => {
                const subject = q.tags[0] || "Uncategorized";
                if (!acc[subject]) acc[subject] = [];
                acc[subject].push(q);
                return acc;
              }, {})
            ).map(([subject, subQuestions]) => (
              <div key={subject} className="subject-group">
                <div style={{
                  background: '#6366f1',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  margin: '20px 0 10px 0',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>SECTION: {subject.toUpperCase()}</span>
                  <span>({subQuestions.length} Questions)</span>
                </div>

                {subQuestions.map((q) => (
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
                          <span key={index} className="tag" style={{ background: index === 1 ? '#e0e7ff' : '' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Add New Question */}
            <div className="add-question" onClick={addQuestion} style={{ cursor: 'pointer' }}>
              <h2>4. Add New Question</h2>
              <div className="add-question-box">
                <p>Click to add a new question to the paper</p>
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
              <button
                className="btn-publish"
                style={{ background: '#4a6cf7', marginBottom: '10px' }}
                onClick={generate20Questions}
                disabled={isGenerating}
              >
                {isGenerating ? "⏳ Generating..." : "📝 Generate 20 Q Paper"}
              </button>
              <button
                className="btn-publish"
                style={{ background: '#6366f1', marginBottom: '10px' }}
                onClick={generateFullExam}
                disabled={isGenerating}
              >
                {isGenerating ? "⏳ Generating..." : "📝 Generate 100 Q Paper"}
              </button>
              <button
                className="btn-publish"
                style={{ background: '#059669', marginBottom: '10px' }}
                onClick={() => setShowPreviewModal(true)}
              >
                👁️ Preview Paper
              </button>
              <button className="btn-publish" onClick={handlePublish}>Publish Now</button>
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
                  <option>10th</option>
                  <option>12th</option>
                  <option>degree</option>
                </select>
              </div>

              <div className="setting-item">
                <label>Attempt Limits</label>
                <input type="text" placeholder="Enter number" />
              </div>
            </div>
          </div>

          {/* Quiz Summary */}
          <div className="quiz-summary">
            <h3>QUIZ SUMMARY</h3>
            <div className="summary-item">
              <span>Difficulty</span>
              <span>Medium-Hard</span>
            </div>
            <div className="summary-item">
              <span>Total Points</span>
              <span>{examDetails.totalMarks || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formal Paper Preview Modal */}
      {showPreviewModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '40px'
        }}>
          <div style={{
            background: '#fff',
            width: '210mm', // A4 width
            height: '297mm', // A4 height
            maxWidth: '100%',
            maxHeight: '100%',
            overflowY: 'auto',
            padding: '20mm',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            position: 'relative',
            fontFamily: '"Times New Roman", Times, serif'
          }}>
            <button
              onClick={() => setShowPreviewModal(false)}
              style={{
                position: 'fixed',
                top: '20px',
                right: '40px',
                padding: '10px 20px',
                background: '#4a6cf7',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 10001
              }}
            >
              Close Preview
            </button>

            <div style={{ border: '2px solid #000', padding: '20px', textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', textTransform: 'uppercase' }}>{examDetails.name}</h1>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', borderTop: '1px solid #000', paddingTop: '10px' }}>
                <div style={{ textAlign: 'left' }}>
                  <strong>Level:</strong> {examDetails.educationLevel}<br />
                  <strong>Maximum Marks:</strong> {examDetails.totalMarks}
                </div>
              </div>
            </div>

            <div style={{ borderBottom: '1px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div>Name: __________________________</div>
                <div>Roll No: ________________________</div>
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <p><strong>INSTRUCTIONS TO CANDIDATES:</strong></p>
              <p style={{ fontStyle: 'italic' }}>{examDetails.instructions}</p>
            </div>

            <div className="questions">
              {questions.map((q, idx) => (
                <div key={idx} style={{ marginBottom: '20px', pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ margin: '0 0 10px 0' }}>
                      <strong>{q.id}.</strong> {q.text}
                    </p>
                    <span style={{ fontWeight: 'bold' }}>({q.marks})</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginLeft: '20px' }}>
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx}>({String.fromCharCode(65 + oIdx)}) {opt}</div>
                    ))}
                  </div>
                  {/* Page break marker like in the scan */}
                  {(idx + 1) % 10 === 0 && (
                    <div style={{ textAlign: 'right', fontStyle: 'italic', fontSize: '10px', marginTop: '10px', borderBottom: '1px dashed #ccc' }}>
                      [P.T.O.]
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #000', marginTop: '40px', paddingTop: '20px', textAlign: 'center', fontSize: '12px' }}>
              *** END OF EXAMINATION PAPER ***
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Qestionpapermanagement;