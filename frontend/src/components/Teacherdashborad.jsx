import React, { useState } from 'react';
import './style/Teacherdashboard.css';
import { useNavigate } from 'react-router-dom';

const Teacherdashborad = () => {
  const [submissions, setSubmissions] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Submitted': return 'status-submitted';
      case 'Graded': return 'status-graded';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Teacher Dashboard</h1>
        <div className="header-info">
          <span className="date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="left-panel">
          <section className="upcoming-classes card">
            <h2>Upcoming Classes</h2>
            
            <div className="class-section">
              <h3 className="section-title">
                <span className="icon">📄</span>
                Question Papers
              </h3>
              {upcomingClasses.filter(c => c.type === 'question-paper').length > 0 ? (
                <ul className="class-list">
                  {upcomingClasses.filter(c => c.type === 'question-paper').map(cls => (
                    <li key={cls.id} className="class-item">
                      <div className="class-info">
                        <strong>{cls.title}</strong>
                        <span>{cls.date} at {cls.time}</span>
                      </div>
                      <button className="btn-settings">Settings</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No upcoming question papers scheduled</p>
              )}
            </div>

            <div className="class-section">
              <h3 className="section-title">
                <span className="icon">📝</span>
                Exams
              </h3>
              {upcomingClasses.filter(c => c.type === 'exam').length > 0 ? (
                <ul className="class-list">
                  {upcomingClasses.filter(c => c.type === 'exam').map(cls => (
                    <li key={cls.id} className="class-item">
                      <div className="class-info">
                        <strong>{cls.title}</strong>
                        <span>{cls.date} at {cls.time}</span>
                      </div>
                      <button className="btn-settings">Settings</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data">No upcoming exams scheduled</p>
              )}
            </div>
          </section>

          <section className="quick-links card">
            <h2>Quick Links</h2>
            <div className="links-grid">
              <button
                className="link-card"
                onClick={() => navigate('/question-paper-management')}
              >
                <span className="link-icon">📋</span>
                <span className="link-text">Manage Question Papers</span>
              </button>
              <button
                className="link-card"
                onClick={() => navigate('/manage-exams')}
              >
                <span className="link-icon">📊</span>
                <span className="link-text">Manage Exams</span>
              </button>
              <button className="link-card">
                <span className="link-icon">👨‍🎓</span>
                <span className="link-text">Student Roster</span>
              </button>
              <button className="link-card">
                <span className="link-icon">📈</span>
                <span className="link-text">Analytics</span>
              </button>
            </div>
            <button
              className="logout-btn"
              onClick={handleLogout}
              style={{
                marginTop: 32,
                width: "100%",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "12px 0",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Logout
            </button>
          </section>
        </div>

        <div className="right-panel">
          <section className="recent-submissions card">
            <div className="submissions-header">
              <h2>Recent Submissions</h2>
              <span className="submission-count">{submissions.length} total</span>
            </div>
            
            <div className="table-container">
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Assignment</th>
                    <th>Status</th>
                    <th>Grade</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(submission => (
                    <tr key={submission.id}>
                      <td className="student-cell">
                        <div className="student-avatar">
                          {submission.student.charAt(0)}
                        </div>
                        {submission.student}
                      </td>
                      <td>{submission.assignment}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(submission.status)}`}>
                          {submission.status}
                        </span>
                      </td>
                      <td>
                        {submission.grade === '--' ? (
                          <select 
                            className="grade-select"
                            onChange={(e) => handleGradeUpdate(submission.id, e.target.value)}
                          >
                            <option value="--">--</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="F">F</option>
                          </select>
                        ) : (
                          <span className="grade-value">{submission.grade}</span>
                        )}
                      </td>
                      <td>
                        <button className="btn-action">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="stats-overview card">
            <h2>Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{submissions.filter(s => s.status === 'Submitted').length}</div>
                <div className="stat-label">To Grade</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{submissions.filter(s => s.status === 'Graded').length}</div>
                <div className="stat-label">Graded</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{upcomingClasses.length}</div>
                <div className="stat-label">Upcoming</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">0</div>
                <div className="stat-label">Avg. Score</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Teacherdashborad;