import React, { useEffect, useState } from 'react';
import './style/Studentmanagement.css';
import { useNavigate } from 'react-router-dom';

function StudentManagement() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/student');
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="student-management-app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <span className="material-symbols-outlined">school</span>
            </div>
            <h2>EduAdmin</h2>
          </div>
          <nav className="nav">
            <a href="#" className="nav-link">Dashboard</a>
            <a href="#" className="nav-link active">Students</a>
            <a href="#" className="nav-link">Batches</a>
            <a href="#" className="nav-link">Courses</a>
          </nav>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="Global search..." />
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <span className="material-symbols-outlined">notifications</span>
              <span className="notif-dot"></span>
            </button>
            <div className="avatar">A</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Page Title Area */}
        <div className="page-title-area">
          <div>
            <h1>Student Management</h1>
            <p className="subtitle">{/* Subtitle should be dynamic */}</p>
          </div>
          <button
            className="add-btn"
            onClick={() => navigate('/add-student')}
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>Add New Student</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">TOTAL STUDENTS</span>
              <span className="material-symbols-outlined stat-icon">groups</span>
            </div>
            <div className="stat-value">{/* Dynamic value */}</div>
            <div className="stat-change positive">
              <span className="material-symbols-outlined">trending_up</span>
              {/* Dynamic change info */}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">ACTIVE TODAY</span>
              <span className="material-symbols-outlined stat-icon">bolt</span>
            </div>
            <div className="stat-value">{/* Dynamic value */}</div>
            <div className="stat-meta">{/* Dynamic engagement info */}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">COURSE COMPLETION</span>
              <span className="material-symbols-outlined stat-icon">workspace_premium</span>
            </div>
            <div className="stat-value">{/* Dynamic value */}</div>
            <div className="stat-meta">{/* Dynamic target info */}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">PENDING TASKS</span>
              <span className="material-symbols-outlined stat-icon">pending_actions</span>
            </div>
            <div className="stat-value">{/* Dynamic value */}</div>
            <div className="stat-meta urgent">{/* Dynamic urgent info */}</div>
          </div>
        </div>

        {/* Filter & Toolbar */}
        <div className="filter-toolbar">
          <div className="filter-left">
            <div className="search-container">
              <span className="material-symbols-outlined search-icon">search</span>
              <input 
                type="text" 
                placeholder="Search by name, email, or ID..." 
                className="search-input"
              />
            </div>
            
            <div className="filter-buttons">
              <label htmlFor="level-select" style={{ marginRight: 8 }}>Level:</label>
              <select id="level-select" className="filter-select">
                <option value="10th">10th Grade</option>
                <option value="12th">12th Grade</option>
                <option value="degree">Degree Level</option>
              </select>
              <button className="filter-btn">
                <span>Status: Active</span>
                <span className="material-symbols-outlined">keyboard_arrow_down</span>
              </button>
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="action-btn" title="Filter">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
            <button className="action-btn" title="Download">
              <span className="material-symbols-outlined">download</span>
            </button>
            <button className="action-btn" title="Print">
              <span className="material-symbols-outlined">print</span>
            </button>
          </div>
        </div>

        {/* Active Chips */}
        <div className="active-chips">
          <div className="chip">
            Level: 10th
            <button className="chip-close material-symbols-outlined">close</button>
          </div>
          <div className="chip">
            Status: Active
            <button className="chip-close material-symbols-outlined">close</button>
          </div>
          <button className="clear-filters">Clear all filters</button>
        </div>

        {/* Student Table */}
        <div className="table-container">
          <table className="student-table">
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                <th>EDUCATION LEVEL</th>
                <th>ASSIGNED BATCH</th>
                <th>STATUS</th>
                <th>EMAIL</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="6" style={{color:'red'}}>{error}</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="6">No students found.</td></tr>
              ) : (
                students.map(student => (
                  <tr key={student._id || student.student_id}>
                    <td>{student.full_name}</td>
                    <td>{student.edu_level}</td>
                    <td>{student.batch}</td>
                    <td>{student.account_status ? 'Active' : 'Inactive'}</td>
                    <td>{student.email}</td>
                    <td className="text-right">
                      {/* Actions like Edit/Delete can go here */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <p className="pagination-info">
            {/* Pagination info should be dynamic */}
          </p>
          <div className="pagination-controls">
            {/* Pagination controls should be dynamic */}
          </div>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <div className="help-card">
            <div className="help-icon">
              <span className="material-symbols-outlined">lightbulb</span>
            </div>
            <div>
              <h4>Quick Tip</h4>
              <p>Hover over a row to reveal quick management actions like Profile Edit and Level Assignment.</p>
            </div>
          </div>
          <div className="help-card">
            <div className="help-icon">
              <span className="material-symbols-outlined">history</span>
            </div>
            <div>
              <h4>Recent Activity</h4>
              <p>34 students were promoted to 'Degree' level in the last 24 hours.</p>
            </div>
          </div>
          <div className="help-card">
            <div className="help-icon">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <div>
              <h4>Need Support?</h4>
              <p>Contact the technical team for bulk student imports and API access issues.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="material-symbols-outlined footer-logo">school</span>
            <span className="footer-text">EduAdmin System</span>
            <span className="footer-divider">|</span>
            <span className="footer-copyright">© 2024 Educational Platform. All rights reserved.</span>
          </div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default StudentManagement;