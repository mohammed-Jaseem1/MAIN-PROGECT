import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import './style/StudentDashboard.css';

function StudentDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [user, setUser] = useState({ name: '', edu_level: '' });
  const [exams, setExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [submissionStatus, setSubmissionStatus] = useState(null); // { score, totalMarks, answers, aiNotes }
  const [pastResults, setPastResults] = useState([]);
  const [viewingResult, setViewingResult] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  // --- PSC Exam Timer State ---
  const [timeLeft, setTimeLeft] = useState(0);      // seconds remaining
  const [timerActive, setTimerActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Coach. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'courses', icon: 'book_5', label: 'My Courses' },
    { id: 'exams', icon: 'assignment_turned_in', label: 'Exams' },
    { id: 'results', icon: 'grade', label: 'My Results' },
    { id: 'ai-notes', icon: 'smart_toy', label: 'AI Notes' },
    { id: 'ai-chat', icon: 'chat', label: 'AI Chat' },
    { id: 'notifications', icon: 'notifications', label: 'Notifications', route: '/student-notifications' }
  ];

  const stats = [
    {
      label: 'Exams Taken',
    },
    {
      label: 'Average Score',

    },
    {
      label: 'Courses Active',

    },
    {
      label: 'Attendance',

    }
  ];

  // State for upcoming exams
  const [upcomingExams, setUpcomingExams] = useState([]);

  const courseProgress = [
    { name: 'Advanced Mathematics', progress: 0 },
    { name: 'English ', progress: 0 },
    { name: 'History', progress: 0 }
  ];

  useEffect(() => {
    // 2. Fetch published exams & notifications
    const fetchData = async (studentLevel, studentId) => {
      try {
        // Fetch Exams
        const examRes = await fetch('http://localhost:5000/api/exams');
        if (examRes.ok) {
          const data = await examRes.json();
          setExams(data);

          const formattedExams = data.map(exam => ({
            id: exam._id,
            title: exam.title,
            description: `${exam.subject || 'General'} - ${Math.floor(calcExamSeconds(exam) / 60)} mins`,
            available: true,
            status: 'AVAILABLE',
            statusColor: 'active',
            subjectIcon: 'assignment',
            subjectColor: 'blue',
            educationLevel: exam.educationLevel
          }));

          if (studentLevel) {
            setUpcomingExams(formattedExams.filter(e =>
              !e.educationLevel ||
              e.educationLevel === studentLevel ||
              e.educationLevel === 'All' ||
              e.educationLevel === 'Standard Exam'
            ));
          } else {
            setUpcomingExams(formattedExams);
          }
        }

        // Fetch Student Results
        if (studentId) {
          const resultRes = await fetch(`http://localhost:5000/api/student/results/${studentId}`);
          if (resultRes.ok) {
            const resultData = await resultRes.json();
            setPastResults(resultData);
          }
        }

        // Fetch Notifications
        const notifRes = await fetch('http://localhost:5000/api/notifications/student');
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(notifData.slice(0, 5).map(n => ({
            id: n._id,
            title: n.title,
            description: n.body,
            time: new Date(n.createdAt).toLocaleTimeString(),
            icon: 'notifications',
            color: 'blue'
          })));
        }

        // Fetch Analysis
        if (studentId) {
          const analysisRes = await fetch(`http://localhost:5000/api/student/analysis/${studentId}`);
          if (analysisRes.ok) {
            const aData = await analysisRes.json();
            setAnalysisData(aData);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    const storedUser = localStorage.getItem('studentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const studentId = parsedUser._id || parsedUser.id;
      const studentLevel = parsedUser.edu_level || '';

      setUser({
        id: studentId,
        name: parsedUser.full_name || 'Student',
        edu_level: studentLevel
      });

      fetchData(studentLevel, studentId);
    } else {
      fetchData(null, null);
    }
  }, []);

  // Fetch chat sessions when switching to AI Chat
  useEffect(() => {
    if (activeNav === 'ai-chat' && user.id) {
      fetchChatSessions();
    }
  }, [activeNav, user.id]);

  const fetchChatSessions = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/chats/student/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setChatSessions(data);
        // If there's an active chat, refresh it; otherwise, don't auto-load
        if (activeChatId) {
          const current = data.find(c => c._id === activeChatId);
          if (current) setChatMessages(current.messages);
        }
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/chats/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id })
      });
      if (res.ok) {
        const newChat = await res.json();
        setChatSessions(prev => [newChat, ...prev]);
        setActiveChatId(newChat._id);
        setChatMessages(newChat.messages);
      }
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  const loadChatSession = (session) => {
    setActiveChatId(session._id);
    setChatMessages(session.messages);
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation(); // Avoid switching terminal to this session
    if (!window.confirm("Are you sure you want to delete this chat session?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setChatSessions(prev => prev.filter(c => c._id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
          setChatMessages([
            { role: 'assistant', content: 'Hello! I am your AI Coach. How can I help you today?' }
          ]);
        }
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  const handleLogout = () => {
    // Clear session/auth data if any (e.g., localStorage, cookies)
    // localStorage.removeItem('token'); // Uncomment if using token
    navigate('/login'); // Redirect to login page
  };

  // Calculate exam duration based on marks (as per recent PSC requirements)
  const calcExamSeconds = (exam) => {
    // Standardize marks to number
    const marks = Number(exam.totalMarks) || (exam.questions ? exam.questions.reduce((s, q) => s + Number(q.marks || 1), 0) : 0);
    let minutes;

    // PSC specific time requirements:
    // 20 mark exam -> 6 minutes
    // 100 mark exam -> 1.5 hours (90 minutes)
    if (marks === 20) {
      minutes = 6;
    } else if (marks === 100) {
      minutes = 90;
    } else {
      minutes = Math.max(10, marks); // Default: 1 min per mark, minimum 10 mins
    }

    return minutes * 60;
  };

  const handleStartExam = (exam) => {
    const originalExam = exams.find(e => e._id === exam.id);
    if (originalExam) {
      setSelectedExam(originalExam);
      setSelectedAnswers({});
      setSubmissionStatus(null);
      const totalSecs = calcExamSeconds(originalExam);
      setTimeLeft(totalSecs);
      setTimerActive(true);
      setShowExamModal(true);
    }
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Format seconds as MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Get timer color class based on time remaining
  const getTimerColor = (secs, totalSecs) => {
    const pct = secs / totalSecs;
    if (pct > 0.5) return '#10b981';   // green - plenty of time
    if (pct > 0.25) return '#f59e0b';  // yellow - halfway gone
    if (pct > 0.1) return '#ef4444';   // red - almost done
    return '#dc2626';                   // deep red - critical
  };

  const getTimerBg = (secs, totalSecs) => {
    const pct = secs / totalSecs;
    if (pct > 0.5) return 'rgba(16, 185, 129, 0.12)';
    if (pct > 0.25) return 'rgba(245, 158, 11, 0.12)';
    return 'rgba(239, 68, 68, 0.12)';
  };

  const handleSubmitAttempt = useCallback(async (isAutoSubmit = false) => {
    if (!selectedExam) return;

    // Stop timer immediately
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    // Check if all questions are answered (skip prompt on auto-submit)
    if (!isAutoSubmit && Object.keys(selectedAnswers).length < selectedExam.questions.length) {
      if (!window.confirm("You haven't answered all questions. Do you still want to submit?")) {
        // Resume timer if user cancels
        setTimerActive(true);
        return;
      }
    }

    const answers = Object.entries(selectedAnswers).map(([qId, optIdx]) => ({
      questionId: parseInt(qId),
      selectedOption: optIdx
    }));

    try {
      const response = await fetch('http://localhost:5000/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          studentName: user.name,
          examId: selectedExam._id,
          answers: answers
        })
      });

      if (response.ok) {
        const data = await response.json();
        const fullExam = { ...selectedExam }; // Keep reference
        setSubmissionStatus({
          score: data.score,
          totalMarks: data.totalMarks,
          aiNotes: data.aiNotes,
          answers: answers,
          examQuestions: fullExam.questions,
          autoSubmitted: isAutoSubmit
        });

        // Refresh past results
        const resultRes = await fetch(`http://localhost:5000/api/student/results/${user.id}`);
        if (resultRes.ok) {
          const resultData = await resultRes.json();
          setPastResults(resultData);
        }

        if (!isAutoSubmit) {
          alert(`Assessment Submitted! Your score: ${data.score}/${data.totalMarks}`);
        }
      } else {
        alert("Failed to submit assessment.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Error submitting assessment.");
    }
  }, [selectedExam, selectedAnswers, user]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerActive || submissionStatus) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          // Auto-submit when time runs out
          handleSubmitAttempt(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timerActive, submissionStatus, handleSubmitAttempt]);

  const handleViewSchedule = () => {
    console.log('Viewing schedule...');
  };

  const handleViewAllExams = () => {
    console.log('Viewing all exams...');
  };

  const handleViewSyllabus = () => {
    console.log('Viewing full syllabus...');
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    let currentChatId = activeChatId;

    // If no active chat, create one first or show a message
    if (!currentChatId) {
      try {
        const res = await fetch('http://localhost:5000/api/chats/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: user.id })
        });
        if (res.ok) {
          const newChat = await res.json();
          setChatSessions(prev => [newChat, ...prev]);
          setActiveChatId(newChat._id);
          currentChatId = newChat._id;
          // Initial greeting is already there
        }
      } catch (err) {
        console.error("Error creating chat automatically:", err);
      }
    }

    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    const messageToSend = chatInput;
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          history: chatMessages.slice(-10),
          chatId: currentChatId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        // Refresh session list to show updated titles/timestamps
        fetchChatSessions();
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please check if the server is running.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === 'ai-chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeNav]);

  return (
    <div className="student-dashboard">
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
          {navItems.map(item => (
            <button
              key={item.id}
              style={{
                background: "#1e293b",
                color: "#fff",
                border: "none",
                textAlign: "left",
                padding: "10px",
                borderRadius: "6px",
                cursor: "pointer",
                marginBottom: "8px",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center"
              }}
              onClick={() => {
                setActiveNav(item.id);
                if (item.route) navigate(item.route);
              }}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span style={{ marginLeft: 8 }}>{item.label}</span>
            </button>
          ))}
        </div>
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
            <span role="img" aria-label="student">🧑‍🎓</span>
          </div>
          <div style={{ fontWeight: "bold", fontSize: "1rem" }}>{user.name}</div>
          <div style={{ fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 8 }}>student@email.com</div>
          <button
            style={{
              background: "#4a6cf7",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1rem",
              marginTop: 8
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
      {/* Main Content Area */}
      <main className="main-content" style={{ width: '100%', marginLeft: 180 }}>
        <div className="content-container">
          {/* Page Heading */}
          <div className="page-header">
            <div className="header-text">
              <h1>Good morning, {user.name}.</h1>
              <p>
                {upcomingExams.length > 0
                  ? `There are ${upcomingExams.length} exams available for you.`
                  : "No exams scheduled for now. Take a break!"}
              </p>
            </div>
            <button className="schedule-btn" onClick={handleViewSchedule}>
              <span className="material-symbols-outlined">calendar_today</span>
              <span>View Schedule</span>
            </button>
          </div>

          {activeNav === 'dashboard' && (
            <>
              {/* Stats Grid */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <p>Exams Taken</p>
                    <span className="material-symbols-outlined">assignment_turned_in</span>
                  </div>
                  <p className="stat-value">{pastResults.length}</p>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <p>Average Score</p>
                    <span className="material-symbols-outlined">grade</span>
                  </div>
                  <p className="stat-value">
                    {pastResults.length > 0
                      ? Math.round((pastResults.reduce((acc, r) => acc + (r.score / r.totalMarks), 0) / pastResults.length) * 100) + '%'
                      : 'N/A'}
                  </p>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <p>Education Level</p>
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <p className="stat-value">{user.edu_level}</p>
                </div>
              </div>

              <div className="content-grid">
                {/* Upcoming Exams Section */}
                <div className="exams-section">
                  <div className="section-header">
                    <h2>Available Exams</h2>
                    <button className="view-all-btn" onClick={() => setActiveNav('exams')}>
                      View all
                    </button>
                  </div>

                  <div className="exams-list">
                    {upcomingExams.length > 0 ? (
                      upcomingExams.slice(0, 3).map((exam) => (
                        <div key={exam.id} className={`exam-card ${exam.available ? 'available' : ''}`}>
                          <div className="exam-content">
                            <div className="exam-header">
                              <span className={`exam-status ${exam.statusColor}`}>
                                {exam.status}
                              </span>
                            </div>
                            <div className="exam-details">
                              <h3>{exam.title}</h3>
                              <p>{exam.description}</p>
                            </div>
                            <div className="exam-actions">
                              <button
                                className="start-exam-btn"
                                onClick={() => handleStartExam(exam)}
                              >
                                <span className="material-symbols-outlined">play_arrow</span>
                                <span>Start Exam</span>
                              </button>
                            </div>
                          </div>
                          <div className={`exam-visual ${exam.subjectColor}`}>
                            <div className="visual-overlay"></div>
                            <span className="material-symbols-outlined">{exam.subjectIcon}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: '#64748b', padding: '20px' }}>No exams available right now.</p>
                    )}
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="right-sidebar">
                  <div style={{ marginTop: '20px', padding: '15px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                    <h4 style={{ color: '#991b1b', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>report_problem</span>
                      Focus Areas
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#7f1d1d' }}>
                      {pastResults.some(r => r.score / r.totalMarks < 0.6)
                        ? "You have some weak spots in your recent exams. Check AI Notes for a personalized study plan."
                        : "Great job! Keep maintaining your current performance."}
                    </p>
                    <button
                      onClick={() => setActiveNav('ai-notes')}
                      style={{ marginTop: '10px', width: '100%', background: '#991b1b', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Improve My Score
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeNav === 'courses' && (
            <div className="courses-section">
              <div className="section-header">
                <h2>My Subjects & Progress</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {Object.entries(
                  pastResults.reduce((acc, result) => {
                    const subject = result.subject || result.examTitle.split(':')[0] || 'General';
                    if (!acc[subject]) acc[subject] = [];
                    acc[subject].push(result);
                    return acc;
                  }, {})
                ).map(([subject, results], idx) => (
                  <div key={idx} style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                        <span className="material-symbols-outlined">book</span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>{subject}</h3>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>
                        <span>Overall Progress</span>
                        <span>{Math.round((results.reduce((acc, r) => acc + (r.score / r.totalMarks), 0) / results.length) * 100)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(results.reduce((acc, r) => acc + (r.score / r.totalMarks), 0) / results.length) * 100}%` }}></div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '10px' }}>Topic-Wise Focus:</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {results.some(r => r.aiNotes) ? (
                          <button
                            onClick={() => {
                              setActiveNav('ai-notes');
                              // In a real app, we'd filter ai-notes by subject here
                            }}
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', color: '#4a6cf7', cursor: 'pointer' }}
                          >
                            View {subject} Notes
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No data yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {pastResults.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ color: '#64748b' }}>Complete your first exam to see subject-wise progress!</p>
                </div>
              )}
            </div>
          )}

          {activeNav === 'exams' && (
            <div className="exams-section">
              <div className="section-header">
                <h2>All Available Exams</h2>
              </div>
              <div className="exams-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className={`exam-card available`}>
                    <div className="exam-content">
                      <div className="exam-details">
                        <h3>{exam.title}</h3>
                        <p>{exam.description}</p>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '5px' }}>Level: {exam.educationLevel}</p>
                      </div>
                      <div className="exam-actions">
                        <button className="start-exam-btn" onClick={() => handleStartExam(exam)}>
                          <span className="material-symbols-outlined">play_arrow</span>
                          <span>Start Exam</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeNav === 'results' && (
            <div className="results-section">
              <div className="section-header">
                <h2>My Examination Results</h2>
              </div>

              {viewingResult ? (
                <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setViewingResult(null)}
                    style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span className="material-symbols-outlined">arrow_back</span> Back to List
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{viewingResult.examTitle}</h3>
                      <p style={{ color: '#64748b' }}>Submitted on: {new Date(viewingResult.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: viewingResult.score / viewingResult.totalMarks >= 0.4 ? '#10b981' : '#ef4444' }}>
                        {viewingResult.score} / {viewingResult.totalMarks}
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: viewingResult.score / viewingResult.totalMarks >= 0.4 ? '#dcfce7' : '#fee2e2',
                        color: viewingResult.score / viewingResult.totalMarks >= 0.4 ? '#166534' : '#991b1b',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginTop: '5px'
                      }}>
                        {viewingResult.score / viewingResult.totalMarks >= 0.4 ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  </div>

                  {viewingResult.aiNotes && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '30px' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4f46e5', marginBottom: '10px' }}>
                        <span className="material-symbols-outlined">smart_toy</span> AI Analysis
                      </h4>
                      <div className="markdown-content" style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }}>
                        <ReactMarkdown>{viewingResult.aiNotes}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  <h4>Question Review</h4>
                  <div style={{ marginTop: '20px' }}>
                    {viewingResult.answers.map((answer, idx) => {
                      const exam = exams.find(e => e._id === viewingResult.examId);
                      const question = exam?.questions.find(q => q.id === answer.questionId);

                      return (
                        <div key={idx} style={{
                          padding: '20px',
                          borderRadius: '12px',
                          marginBottom: '20px',
                          border: '1px solid',
                          borderColor: answer.isCorrect ? '#bbf7d0' : '#fecaca',
                          background: answer.isCorrect ? '#f0fdf4' : '#fef2f2',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>Question {idx + 1}</span>
                            <span style={{
                              color: answer.isCorrect ? '#16a34a' : '#dc2626',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: answer.isCorrect ? '#dcfce7' : '#fee2e2'
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                {answer.isCorrect ? 'check_circle' : 'cancel'}
                              </span>
                              {answer.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>

                          {question ? (
                            <>
                              <p style={{ fontWeight: '500', fontSize: '1.05rem', marginBottom: '15px', color: '#334155' }}>{question.text}</p>

                              <div style={{ display: 'grid', gap: '8px' }}>
                                {question.options.map((opt, optIdx) => {
                                  let bgColor = 'white';
                                  let borderColor = '#e2e8f0';
                                  let icon = null;

                                  if (optIdx === question.correctAnswer) {
                                    bgColor = '#dcfce7';
                                    borderColor = '#10b981';
                                    icon = 'check_circle';
                                  } else if (optIdx === answer.selectedOption && !answer.isCorrect) {
                                    bgColor = '#fee2e2';
                                    borderColor = '#ef4444';
                                    icon = 'cancel';
                                  }

                                  return (
                                    <div key={optIdx} style={{
                                      padding: '12px 16px',
                                      borderRadius: '8px',
                                      border: '2px solid',
                                      borderColor: borderColor,
                                      background: bgColor,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      fontSize: '0.95rem'
                                    }}>
                                      <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                      {icon && <span className="material-symbols-outlined" style={{ fontSize: '20px', color: borderColor === '#10b981' ? '#10b981' : '#ef4444' }}>{icon}</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          ) : (
                            <>
                              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Question details unavailable in local cache.</p>
                              <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                                Your Selection: <span style={{ fontWeight: '500' }}>Option {String.fromCharCode(65 + answer.selectedOption)}</span>
                              </p>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="results-list" style={{ display: 'grid', gap: '15px' }}>
                  {pastResults.length > 0 ? (
                    pastResults.map((result) => (
                      <div key={result._id} style={{
                        background: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{result.examTitle}</h3>
                          <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.85rem' }}>
                            <span>Date: {new Date(result.submittedAt).toLocaleDateString()}</span>
                            <span>Marks: {result.score}/{result.totalMarks}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setViewingResult(result)}
                          style={{
                            background: '#4a6cf7',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Review Result
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94a3b8' }}>sentiment_dissatisfied</span>
                      <p style={{ marginTop: '10px', color: '#64748b' }}>No exam results found yet. Take an exam to see your performance!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeNav === 'ai-notes' && (
            <div className="ai-notes-section">
              <div className="section-header">
                <h2>AI Study Guide & Personalized Notes</h2>
              </div>

              {/* Weak Points Summary Card */}
              {pastResults.length > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: 'white',
                  padding: '30px',
                  borderRadius: '20px',
                  marginBottom: '30px',
                  boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>psychology</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Smart Analysis Summary</h3>
                      <p style={{ opacity: 0.9, fontSize: '0.95rem' }}>Based on your last {pastResults.length} assessments</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8 }}>Overall Mastery</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                        {pastResults.length > 0
                          ? Math.round((pastResults.reduce((acc, r) => acc + (r.score / r.totalMarks), 0) / pastResults.length) * 100) + '%'
                          : '0%'}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8 }}>Topics to Review</span>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                        {pastResults.filter(r => r.score / r.totalMarks < 0.7).length} Subjects
                      </div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8 }}>Learning Status</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '5px' }}>
                        {pastResults.length > 0 && (pastResults[0].score / pastResults[0].totalMarks > 0.8) ? 'Consistent' : 'Needs Focus'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gap: '20px' }}>
                {pastResults.filter(r => r.aiNotes).length > 0 ? (
                  pastResults.filter(r => r.aiNotes).map((result, idx) => (
                    <div key={idx} style={{
                      background: 'white',
                      padding: '25px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: '4px' }}>{result.examTitle}</h3>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                            Based on attempt from {new Date(result.submittedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={{ background: '#f0f7ff', color: '#4a6cf7', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                          AI Generated
                        </div>
                      </div>
                      <div className="markdown-content" style={{
                        color: '#334155',
                        lineHeight: '1.7',
                        fontSize: '1rem'
                      }}>
                        <ReactMarkdown>{result.aiNotes}</ReactMarkdown>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#94a3b8', marginBottom: '15px' }}>psychology</span>
                    <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>No personalized notes yet</h3>
                    <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>
                      Take an exam to receive AI-powered feedback and personalized study recommendations based on your performance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          {activeNav === 'ai-chat' && (
            <div className="ai-chat-section" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>AI Coach - Your Personal Tutor</h2>
                <button
                  onClick={handleCreateNewChat}
                  style={{
                    background: '#4a6cf7',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                  New Chat
                </button>
              </div>

              <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: '260px 1fr',
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}>
                {/* Chat Sessions Sidebar */}
                <div style={{
                  borderRight: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>
                    Recent Chats
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {chatSessions.length > 0 ? (
                      chatSessions.map((session) => (
                        <div
                          key={session._id}
                          style={{
                            position: 'relative',
                            marginBottom: '4px',
                          }}
                        >
                          <button
                            onClick={() => loadChatSession(session)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '12px',
                              paddingRight: '35px',
                              borderRadius: '8px',
                              border: 'none',
                              background: activeChatId === session._id ? '#e2e8f0' : 'transparent',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <span style={{ fontSize: '0.9rem', fontWeight: activeChatId === session._id ? '600' : '500', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {session.title}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteChat(e, session._id)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                            title="Delete Chat"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        No chat history yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Chat Area */}
                <div style={{ display: 'flex', flexDirection: 'column', background: 'white' }}>
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '12px 18px',
                        borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                        background: msg.role === 'user' ? '#4a6cf7' : '#f1f5f9',
                        color: msg.role === 'user' ? 'white' : '#1e293b',
                        fontSize: '0.95rem',
                        lineHeight: '1.5',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <div className="chat-content">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div style={{ alignSelf: 'flex-start', background: '#f1f5f9', padding: '12px 18px', borderRadius: '18px 18px 18px 2px' }}>
                        <div className="typing-indicator">
                          <div className="dot"></div>
                          <div className="dot"></div>
                          <div className="dot"></div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} style={{
                    padding: '20px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '10px',
                    background: '#ffffff'
                  }}>
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask anything about your syllabus..."
                      style={{
                        flex: 1,
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '1rem',
                        outline: 'none',
                        background: '#f8fafc',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#4a6cf7'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                      disabled={isChatLoading}
                    />
                    <button
                      type="submit"
                      disabled={isChatLoading || !chatInput.trim()}
                      style={{
                        background: '#4a6cf7',
                        color: 'white',
                        border: 'none',
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(74, 108, 247, 0.3)',
                        transition: 'transform 0.2s, background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Exam View Modal */}
      {
        showExamModal && selectedExam && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}>
            <div style={{
              background: 'white',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              borderRadius: '12px',
              overflowY: 'auto',
              padding: '30px',
              position: 'relative',
              color: '#1e293b'
            }}>
              {/* ===== PSC Timer Header Bar ===== */}
              {!submissionStatus && (
                <div style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  background: 'white',
                  borderBottom: '2px solid #f1f5f9',
                  margin: '-30px -30px 24px -30px',
                  padding: '14px 30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                }}>
                  {/* Exam title + meta */}
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>{selectedExam.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {selectedExam.subject} &nbsp;|&nbsp; {selectedExam.totalMarks} Marks
                    </div>
                  </div>

                  {/* Timer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: getTimerBg(timeLeft, calcExamSeconds(selectedExam)),
                      border: `2px solid ${getTimerColor(timeLeft, calcExamSeconds(selectedExam))}`,
                      borderRadius: '12px',
                      padding: '8px 18px',
                      animation: timeLeft <= calcExamSeconds(selectedExam) * 0.1 ? 'pulse-timer 1s infinite' : 'none'
                    }}>
                      <span className="material-symbols-outlined" style={{
                        fontSize: '22px',
                        color: getTimerColor(timeLeft, calcExamSeconds(selectedExam))
                      }}>timer</span>
                      <span style={{
                        fontSize: '1.6rem',
                        fontWeight: '800',
                        fontFamily: 'monospace',
                        letterSpacing: '2px',
                        color: getTimerColor(timeLeft, calcExamSeconds(selectedExam))
                      }}>{formatTime(timeLeft)}</span>
                    </div>

                    {/* Close / Exit button */}
                    <button
                      onClick={() => {
                        if (window.confirm('⚠️ Are you sure you want to exit? Your progress will be lost and the exam will not be submitted.')) {
                          setTimerActive(false);
                          if (timerRef.current) clearInterval(timerRef.current);
                          setShowExamModal(false);
                        }
                      }}
                      style={{
                        border: 'none',
                        background: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        width: '36px',
                        height: '36px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Exit Exam"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Exam info (shown only before submission) */}
              {!submissionStatus && (
                <>
                  <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <span>📚 Subject: <strong style={{ color: '#1e293b' }}>{selectedExam.subject}</strong></span>
                    <span>•</span>
                    <span>⏱ Time Allowed: <strong style={{ color: '#1e293b' }}>{Math.round(calcExamSeconds(selectedExam) / 60)} minutes</strong></span>
                    <span>•</span>
                    <span>🏆 Total Marks: <strong style={{ color: '#1e293b' }}>{selectedExam.totalMarks}</strong></span>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px 16px', borderRadius: '10px', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#92400e', marginBottom: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>info</span>
                      Instructions
                    </div>
                    <p style={{ color: '#78350f', fontSize: '0.9rem', margin: 0 }}>
                      {selectedExam.instructions || 'Answer all questions carefully. Each question carries the marks shown. The exam will auto-submit when the timer reaches zero.'}
                    </p>
                  </div>
                </>
              )}

              {/* Close button for post-submission view */}
              {submissionStatus && (
                <button
                  onClick={() => setShowExamModal(false)}
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    border: 'none',
                    background: '#f1f5f9',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}

              {submissionStatus ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  {submissionStatus.autoSubmitted && (
                    <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 20px', marginBottom: '20px', fontSize: '0.9rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>timer_off</span>
                      Time's up! Your exam was auto-submitted.
                    </div>
                  )}
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4',
                    color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px', fontSize: '40px'
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>check_circle</span>
                  </div>
                  <h2>Exam Completed!</h2>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '15px 0', color: '#1e293b' }}>
                    Score: {submissionStatus.score} / {submissionStatus.totalMarks}
                  </div>

                  {submissionStatus.aiNotes && (
                    <div style={{
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'left',
                      margin: '25px 0',
                      boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#4f46e5',
                        fontWeight: '800',
                        fontSize: '1.1rem',
                        marginBottom: '15px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>analytics</span>
                        AI Performance Insight
                      </div>
                      <div className="markdown-content" style={{
                        color: '#334155',
                        fontSize: '1rem',
                        lineHeight: '1.7'
                      }}>
                        <ReactMarkdown>{submissionStatus.aiNotes}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ textAlign: 'left', marginBottom: '15px' }}>Detailed Answer Review</h4>
                    {submissionStatus.answers.map((ans, idx) => {
                      const q = submissionStatus.examQuestions.find(eq => eq.id === ans.questionId);
                      return (
                        <div key={idx} style={{
                          padding: '12px',
                          borderRadius: '6px',
                          marginBottom: '10px',
                          background: ans.isCorrect ? '#f0fdf4' : '#fef2f2',
                          border: '1px solid',
                          borderColor: ans.isCorrect ? '#bbf7d0' : '#fecaca',
                          textAlign: 'left'
                        }}>
                          <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Q{idx + 1}: {q?.text || 'Question'}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem' }}>
                            <span>Your answer: <strong>{q?.options[ans.selectedOption] || 'N/A'}</strong></span>
                            {ans.isCorrect ? (
                              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Correct</span>
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: 'bold' }}>✗ Incorrect</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ color: '#64748b', marginBottom: '30px' }}>Your results have been submitted and saved.</p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        setShowExamModal(false);
                        setActiveNav('results');
                      }}
                      style={{
                        background: '#4a6cf7', color: 'white', border: 'none',
                        padding: '12px 30px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
                      }}
                    >
                      View History
                    </button>
                    <button
                      onClick={() => setShowExamModal(false)}
                      style={{
                        background: '#f1f5f9', color: '#475569', border: 'none',
                        padding: '12px 30px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="questions-list">
                    {selectedExam.questions.map((q, idx) => (
                      <div key={idx} style={{ marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
                        <p style={{ fontWeight: '600', marginBottom: '12px' }}>
                          Q{idx + 1}. {q.text} <span style={{ float: 'right', fontWeight: 'normal', color: '#94a3b8' }}>[{q.marks} Marks]</span>
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              onClick={() => handleOptionSelect(q.id, optIdx)}
                              style={{
                                padding: '12px 15px',
                                border: selectedAnswers[q.id] === optIdx ? '2px solid #4a6cf7' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                background: selectedAnswers[q.id] === optIdx ? '#f0f7ff' : '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{
                                width: '20px', height: '20px', borderRadius: '50%',
                                border: '2px solid ' + (selectedAnswers[q.id] === optIdx ? '#4a6cf7' : '#cbd5e1'),
                                marginRight: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                {selectedAnswers[q.id] === optIdx && (
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4a6cf7' }}></div>
                                )}
                              </div>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <button
                      onClick={handleSubmitAttempt}
                      style={{
                        background: '#4a6cf7',
                        color: 'white',
                        border: 'none',
                        padding: '12px 40px',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 6px -1px rgba(74, 108, 247, 0.4)'
                      }}
                    >
                      Submit Final Attempt
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      }
    </div>
  );
}

export default StudentDashboard;