import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './style/ManageExams.css';

const ManageExams = () => {
  const [filters, setFilters] = useState({
    subject: 'All Subjects',
    status: 'All Statuses'
  });

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedExamResults, setSelectedExamResults] = useState(null); // Results for a specific exam
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, resultsRes] = await Promise.all([
          fetch('http://localhost:5000/api/exams'),
          fetch('http://localhost:5000/api/exams/results')
        ]);

        if (examsRes.ok && resultsRes.ok) {
          const examsData = await examsRes.json();
          const resultsData = await resultsRes.json();

          setExams(examsData.map(exam => ({
            ...exam,
            id: exam._id,
            code: exam.subject ? exam.subject.substring(0, 3).toUpperCase() + '-' + exam._id.substring(exam._id.length - 4) : 'EXAM-' + exam._id.substring(exam._id.length - 4),
            participation: resultsData.filter(r => r.examId === exam._id).length,
            status: exam.status || 'Published',
            actions: 'View Results'
          })));
          setResults(resultsData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Exams', value: '', color: '#4f46e5' },
    { label: 'Active Now', value: '', subtext: '(%)', color: '#10b981' },
    { label: 'Pending Reviews', value: '', color: '#f59e0b' },
    { label: 'Completion Rate', value: '', color: '#3b82f6' }
  ];

  const handleRemoveFilter = (type) => {
    setActiveFilters(activeFilters.filter(filter => filter !== type));
  };

  const handleClearAllFilters = () => {
    setActiveFilters([]);
  };

  const getStatusClass = (status) => {
    if (!status) return 'status-published';
    switch (status.toLowerCase()) {
      case 'ongoing': return 'status-ongoing';
      case 'published': return 'status-published';
      case 'completed': return 'status-completed';
      case 'draft': return 'status-draft';
      default: return 'status-published';
    }
  };

  const handleViewResults = (examId) => {
    const examResults = results.filter(r => r.examId === examId);
    const exam = exams.find(e => e.id === examId);
    setSelectedExamResults({ exam, results: examResults });
    setShowResultsModal(true);
  };

  return (
    <div className="manage-exams">
      <header className="manage-exams-header">
        <h1>Manage Exams</h1>
        <p className="subtitle">Create, monitor, and review your student assessments.</p>
      </header>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderColor: stat.color }}>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            {stat.subtext && <div className="stat-subtext">{stat.subtext}</div>}
          </div>
        ))}
      </div>

      <div className="content-section">
        <div className="filters-section">
          <div className="filter-group">
            <select
              className="filter-select"
              value={filters.subject}
              onChange={(e) => {
                setFilters({ ...filters, subject: e.target.value });
                if (e.target.value !== 'All Subjects') {
                  setActiveFilters([...activeFilters.filter(f => f !== 'Mathematics'), 'Mathematics']);
                }
              }}
            >
              <option>All Subjects</option>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>History</option>
              <option>Computer Science</option>
            </select>

            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                if (e.target.value !== 'All Statuses') {
                  setActiveFilters([...activeFilters.filter(f => f !== 'Ongoing'), 'Ongoing']);
                }
              }}
            >
              <option>All Statuses</option>
              <option>Ongoing</option>
              <option>Published</option>
              <option>Completed</option>
              <option>Draft</option>
            </select>
          </div>

          {activeFilters.length > 0 && (
            <div className="active-filters">
              {activeFilters.map((filter, index) => (
                <div key={index} className="filter-tag">
                  {filter}
                  <button
                    className="remove-filter"
                    onClick={() => handleRemoveFilter(filter)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                className="clear-all-btn"
                onClick={handleClearAllFilters}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="exams-table-container">
          <table className="exams-table">
            <thead>
              <tr>
                <th>Exam Title</th>
                <th>SUBJECT</th>
                <th>EDUCATION LEVEL</th>
                <th>SCHEDULED DATE</th>
                <th>STATUS</th>
                <th>PARTICIPATION</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="exam-title-cell">
                    <div className="exam-title">{exam.title}</div>
                    <div className="exam-code">{exam.code}</div>
                  </td>
                  <td>{exam.subject}</td>
                  <td>{exam.educationLevel}</td>
                  <td>{exam.date}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="participation-cell">{exam.participation} students</td>
                  <td>
                    <button
                      className={`action-btn action-view-results`}
                      onClick={() => handleViewResults(exam.id)}
                    >
                      View Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing-info">
            Showing 1 to {exams.length} of {exams.length} exams
          </div>
          <div className="pagination">
            <button className="page-btn disabled">Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>

      {showResultsModal && selectedExamResults && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
        }}>
          <div style={{
            background: 'white', width: '100%', maxWidth: '900px', maxHeight: '90vh',
            borderRadius: '12px', overflowY: 'auto', padding: '30px', position: 'relative'
          }}>
            <button
              onClick={() => setShowResultsModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', border: 'none',
                background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h2 style={{ marginBottom: '10px' }}>Results: {selectedExamResults.exam.title}</h2>
            <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '0.9rem', marginBottom: '25px' }}>
              <span>Subject: {selectedExamResults.exam.subject}</span>
              <span>•</span>
              <span>Level: {selectedExamResults.exam.educationLevel}</span>
              <span>•</span>
              <span>Total Participation: {selectedExamResults.results.length}</span>
            </div>

            {selectedExamResults.results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                No students have taken this exam yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: '12px' }}>Student Name</th>
                      <th style={{ padding: '12px' }}>Score</th>
                      <th style={{ padding: '12px' }}>Percentage</th>
                      <th style={{ padding: '12px' }}>AI Insights</th>
                      <th style={{ padding: '12px' }}>Result</th>
                      <th style={{ padding: '12px' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedExamResults.results.map((res, idx) => {
                      const percentage = ((res.score / res.totalMarks) * 100).toFixed(1);
                      return (
                        <React.Fragment key={idx}>
                          <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{res.studentName}</td>
                            <td style={{ padding: '12px' }}>{res.score} / {res.totalMarks}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                padding: '4px 8px', borderRadius: '4px',
                                background: percentage >= 50 ? '#f0fdf4' : '#fef2f2',
                                color: percentage >= 50 ? '#16a34a' : '#dc2626',
                                fontWeight: 'bold'
                              }}>
                                {percentage}%
                              </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <button
                                onClick={() => {
                                  // Toggle expanded view for this student's AI notes
                                  const expandedIdx = selectedExamResults.expandedIdx === idx ? null : idx;
                                  setSelectedExamResults({
                                    ...selectedExamResults,
                                    expandedIdx,
                                    expandedResultIdx: null
                                  });
                                }}
                                style={{
                                  background: '#4f46e5',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 14px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: '0.2s'
                                }}
                              >
                                {selectedExamResults.expandedIdx === idx ? (
                                  <>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_less</span>
                                    Close Notes
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
                                    View AI Notes
                                  </>
                                )}
                              </button>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <button
                                onClick={() => {
                                  // Toggle expanded view for this student's full result
                                  const expandedResultIdx = selectedExamResults.expandedResultIdx === idx ? null : idx;
                                  setSelectedExamResults({
                                    ...selectedExamResults,
                                    expandedResultIdx,
                                    expandedIdx: null
                                  });
                                }}
                                style={{
                                  background: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 14px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: '0.2s'
                                }}
                              >
                                {selectedExamResults.expandedResultIdx === idx ? (
                                  <>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_less</span>
                                    Close Result
                                  </>
                                ) : (
                                  <>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>assignment</span>
                                    View Result
                                  </>
                                )}
                              </button>
                            </td>
                            <td style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>
                              {new Date(res.submittedAt).toLocaleDateString()}
                            </td>
                          </tr>
                          {selectedExamResults.expandedIdx === idx && (
                            <tr>
                              <td colSpan={6} style={{ padding: '0 12px 20px 12px' }}>
                                <div style={{
                                  background: '#f8fafc',
                                  padding: '24px',
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                  marginTop: '8px',
                                  animation: 'slideDown 0.3s ease-out'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#4f46e5' }}>auto_stories</span>
                                    <h4 style={{ margin: 0, color: '#1e293b' }}>Personalized Learning Material</h4>
                                  </div>
                                  <div className="markdown-content" style={{
                                    fontSize: '0.92rem',
                                    lineHeight: '1.7',
                                    color: '#475569',
                                    backgroundColor: 'white',
                                    padding: '24px',
                                    borderRadius: '8px',
                                    border: '1px solid #f1f5f9',
                                    '& h1, h2, h3': { color: '#1e293b', marginTop: '16px', marginBottom: '8px' },
                                    '& p': { marginBottom: '12px' }
                                  }}>
                                    {res.aiNotes ? (
                                      <ReactMarkdown>{res.aiNotes}</ReactMarkdown>
                                    ) : (
                                      <p>The AI is currently processing notes for this student or were not generated.</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                          {selectedExamResults.expandedResultIdx === idx && (
                            <tr>
                              <td colSpan={6} style={{ padding: '0 12px 20px 12px' }}>
                                <div style={{
                                  background: '#f8fafc',
                                  padding: '24px',
                                  borderRadius: '12px',
                                  border: '1px solid #e2e8f0',
                                  marginTop: '8px',
                                  animation: 'slideDown 0.3s ease-out'
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                    <span className="material-symbols-outlined" style={{ color: '#10b981' }}>assignment</span>
                                    <h4 style={{ margin: 0, color: '#1e293b' }}>Detailed Question Review</h4>
                                  </div>
                                  <div style={{ display: 'grid', gap: '20px' }}>
                                    {res.answers.map((answer, qIdx) => {
                                      const question = selectedExamResults.exam.questions.find(q => q.id === answer.questionId);
                                      return (
                                        <div key={qIdx} style={{
                                          padding: '20px',
                                          borderRadius: '12px',
                                          background: answer.isCorrect ? '#f0fdf4' : '#fef2f2',
                                          border: '1px solid',
                                          borderColor: answer.isCorrect ? '#bbf7d0' : '#fecaca'
                                        }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontWeight: '700', color: '#1e293b' }}>Question {qIdx + 1}</span>
                                            <span style={{
                                              color: answer.isCorrect ? '#16a34a' : '#dc2626',
                                              display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold',
                                              fontSize: '0.9rem', padding: '4px 10px', borderRadius: '20px',
                                              background: answer.isCorrect ? '#dcfce7' : '#fee2e2'
                                            }}>
                                              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                                {answer.isCorrect ? 'check_circle' : 'cancel'}
                                              </span>
                                              {answer.isCorrect ? 'Correct' : 'Incorrect'}
                                            </span>
                                          </div>
                                          {question ? (
                                            <>
                                              <p style={{ marginBottom: '15px', fontWeight: '500', color: '#334155' }}>{question.text}</p>
                                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                                                {question.options.map((opt, optIdx) => {
                                                  let bgColor = 'white';
                                                  let borderColor = '#e2e8f0';
                                                  let fontWeight = '400';
                                                  if (optIdx === question.correctAnswer) {
                                                    bgColor = '#dcfce7';
                                                    borderColor = '#10b981';
                                                    fontWeight = '600';
                                                  } else if (optIdx === answer.selectedOption && !answer.isCorrect) {
                                                    bgColor = '#fee2e2';
                                                    borderColor = '#ef4444';
                                                    fontWeight = '600';
                                                  }
                                                  return (
                                                    <div key={optIdx} style={{
                                                      padding: '10px 14px',
                                                      borderRadius: '8px',
                                                      border: '1px solid',
                                                      borderColor: borderColor,
                                                      background: bgColor,
                                                      fontSize: '0.9rem',
                                                      color: '#1e293b',
                                                      fontWeight: fontWeight,
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      gap: '10px'
                                                    }}>
                                                      <span style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', fontSize: '0.75rem' }}>
                                                        {String.fromCharCode(65 + optIdx)}
                                                      </span>
                                                      {opt}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </>
                                          ) : (
                                            <p style={{ color: '#64748b', fontStyle: 'italic' }}>Question details unavailable in this exam record.</p>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <h3>Exam Details (Reference Paper)</h3>
              <div style={{ marginTop: '10px', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                <p><strong>Instructions:</strong> {selectedExamResults.exam.instructions}</p>
                <p style={{ marginTop: '10px' }}><strong>Total Questions:</strong> {selectedExamResults.exam.questions.length}</p>
                <div style={{ marginTop: '15px' }}>
                  <strong>Question Breakdown:</strong>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {selectedExamResults.exam.questions.slice(0, 5).map((q, i) => (
                      <li key={i} style={{ marginBottom: '5px', fontSize: '0.9rem' }}>
                        Q{i + 1}: {q.text.substring(0, 80)}...
                      </li>
                    ))}
                    {selectedExamResults.exam.questions.length > 5 && (
                      <li style={{ fontStyle: 'italic', fontSize: '0.8rem' }}>and {selectedExamResults.exam.questions.length - 5} more questions...</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExams;
