import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import './style/StudentDashboard.css';

function StudentDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [user, setUser] = useState({ name: '' }); // Add user state
  const navigate = useNavigate(); // Add this line

  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'courses', icon: 'book_5', label: 'My Courses' },
    { id: 'exams', icon: 'assignment_turned_in', label: 'Exams' },
    { id: 'assignments', icon: 'edit_note', label: 'Assignments' },
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

  const upcomingExams = [
    {
      id: 1,
      title: 'Advanced Mathematics (MATH401)',
     
    },
    {
      id: 2,
      title: 'History (CS302)',
   
    }
  ];

  const courseProgress = [
    { name: 'Advanced Mathematics', progress: 0 },
    { name: 'English ', progress: 0 },
    { name: 'History', progress: 0 }
  ];

  const notifications = [

  ];

  useEffect(() => {
    // Fetch user info from backend or localStorage
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/student/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          // Fix: Use correct property for name
          setUser({ name: data.full_name || data.name || data.username || 'Student' });
        } else {
          setUser({ name: 'Student' });
        }
      } catch {
        setUser({ name: 'Student' });
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    // Clear session/auth data if any (e.g., localStorage, cookies)
    // localStorage.removeItem('token'); // Uncomment if using token
    navigate('/login'); // Redirect to login page
  };

  const handleStartExam = (examName) => {
    console.log(`Starting exam: ${examName}`);
  };

  const handleViewSchedule = () => {
    console.log('Viewing schedule...');
  };

  const handleViewAllExams = () => {
    console.log('Viewing all exams...');
  };

  const handleViewSyllabus = () => {
    console.log('Viewing full syllabus...');
  };

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
              <p>You have 2 exams today. Keep up the great work!</p>
            </div>
            <button className="schedule-btn" onClick={handleViewSchedule}>
              <span className="material-symbols-outlined">calendar_today</span>
              <span>View Schedule</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  <p>{stat.label}</p>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <p className="stat-value">{stat.value}</p>
                <p className={`stat-change ${stat.trend ? 'trend-' + stat.trend : ''}`}>
                  {stat.trend === 'up' && (
                    <span className="material-symbols-outlined">trending_up</span>
                  )}
                  {stat.change}
                </p>
              </div>
            ))}
          </div>

          <div className="content-grid">
            {/* Upcoming Exams Section */}
            <div className="exams-section">
              <div className="section-header">
                <h2>Upcoming Exams</h2>
                <button className="view-all-btn" onClick={handleViewAllExams}>
                  View all
                </button>
              </div>
              
              <div className="exams-list">
                {upcomingExams.map((exam) => (
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
                        {exam.available ? (
                          <>
                            <button 
                              className="start-exam-btn"
                              onClick={() => handleStartExam(exam.title)}
                            >
                              <span className="material-symbols-outlined">play_arrow</span>
                              <span>Start Exam</span>
                            </button>
                            <button className="prep-notes-btn">
                              <span className="material-symbols-outlined">description</span>
                              <span>Prep Notes</span>
                            </button>
                          </>
                        ) : (
                          <button className="locked-exam-btn" disabled>
                            <span className="material-symbols-outlined">lock</span>
                            <span>{exam.availableTime}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={`exam-visual ${exam.subjectColor}`}>
                      <div className="visual-overlay"></div>
                      <span className="material-symbols-outlined">{exam.subjectIcon}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar: Progress & Notifications */}
            <div className="right-sidebar">
              {/* Course Progress Tracker */}
              <div className="progress-card">
                <h3>Course Progress</h3>
                <div className="progress-list">
                  {courseProgress.map((course, index) => (
                    <div key={index} className="progress-item">
                      <div className="progress-header">
                        <span>{course.name}</span>
                        <span className="progress-percent">{course.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="syllabus-btn" onClick={handleViewSyllabus}>
                  View Full Syllabus
                </button>
              </div>

              {/* Notifications Feed */}
              <div className="notifications-card">
                <h3>Recent Notifications</h3>
                <div className="notifications-list">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <div className={`notification-icon ${notification.color}`}>
                        <span className="material-symbols-outlined">
                          {notification.icon}
                        </span>
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">{notification.title}</p>
                        <p className="notification-description">
                          {notification.description}
                        </p>
                        <p className="notification-time">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
 );
};

export default StudentDashboard;