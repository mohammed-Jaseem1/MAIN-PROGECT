import React, { useEffect, useState } from 'react';
import './style/Studentmanagement.css';
import { useNavigate, useLocation } from 'react-router-dom';

function StudentManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    activeToday: 0,
  });

  // Filter states
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/student');
        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data);

        // Stats
        const total = data.length;
        const today = new Date().toISOString().slice(0, 10);
        const activeToday = data.filter(
          s =>
            s.account_status &&
            s.last_active &&
            s.last_active.slice(0, 10) === today
        ).length;

        setStats({ total, activeToday });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Filter students
  const filteredStudents = students.filter(student => {
    // Search filter
    const searchMatch =
      search === '' ||
      (student.full_name && student.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(search.toLowerCase())) ||
      (student.student_id && student.student_id.toString().includes(search));
    // Level filter
    const levelMatch =
      level === 'all' || (student.edu_level && student.edu_level.toLowerCase() === level.toLowerCase());
    // Status filter
    const statusMatch =
      status === 'all' ||
      (status === 'active' && student.account_status) ||
      (status === 'inactive' && !student.account_status);
    return searchMatch && levelMatch && statusMatch;
  });

  // Clear filters
  const clearFilters = () => {
    setSearch('');
    setLevel('all');
    setStatus('all');
  };

  // Sidebar nav items
  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Students', path: '/student-management' },
    { label: 'Batches', path: '/batches' },
    { label: 'Courses', path: '/courses' }
  ];

  // Add delete handler
  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(s => (s._id || s.student_id) !== studentId));
    }
  };

  return (
    <div className="student-management-app" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          minHeight: '100vh',
          background: '#1e293b',
          color: '#fff',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1200,
          boxShadow: '0 2px 8px rgba(30,41,59,0.08)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 40,
            height: 40,
            background: '#2563eb',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <span className="material-symbols-outlined">school</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>EduAdmin</span>
        </div>
        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 16px',
                borderRadius: 6,
                color: '#fff',
                fontWeight: 600,
                background: location.pathname === item.path
                  ? '#2563eb'
                  : 'transparent',
                marginBottom: 8,
                textDecoration: 'none',
                border: 'none',
                cursor: 'pointer',
                boxShadow: location.pathname === item.path
                  ? '0 2px 8px rgba(37,99,235,0.15)'
                  : 'none'
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(51,65,85,0.15)',
          borderRadius: 6,
          padding: '10px 12px'
        }}>
          <div style={{
            width: 32,
            height: 32,
            background: '#10b981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700
          }}>A</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Admin User</div>
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>Super Admin</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          paddingRight: 32,
        }}
      >
        {/* Header */}
        {/* Removed header */}
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
              <div className="stat-value">
                {loading ? '...' : stats.total}
              </div>
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
              <div className="stat-value">
                {loading ? '...' : stats.activeToday}
              </div>
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
                <input 
                  type="text" 
                  placeholder="Search by name, email, or ID..." 
                  className="search-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              
              <div className="filter-buttons">
                <label htmlFor="level-select" style={{ marginRight: 8 }}>Level:</label>
                <select
                  id="level-select"
                  className="filter-select"
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="10th">10th Grade</option>
                  <option value="12th">12th Grade</option>
                  <option value="degree">Degree Level</option>
                </select>
                <button
                  className="filter-btn"
                  onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                  type="button"
                >
                  <span>Status: {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  <span className="material-symbols-outlined">keyboard_arrow_down</span>
                </button>
              </div>
            </div>
            
            <div className="filter-actions">
              <button className="action-btn" title="Filter" onClick={clearFilters}>
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
            {level !== 'all' && (
              <div className="chip">
                Level: {level}
                <button className="chip-close material-symbols-outlined" onClick={() => setLevel('all')}>close</button>
              </div>
            )}
            {status !== 'all' && (
              <div className="chip">
                Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                <button className="chip-close material-symbols-outlined" onClick={() => setStatus('all')}>close</button>
              </div>
            )}
            {search && (
              <div className="chip">
                Search: {search}
                <button className="chip-close material-symbols-outlined" onClick={() => setSearch('')}>close</button>
              </div>
            )}
            {(level !== 'all' || status !== 'all' || search) && (
              <button className="clear-filters" onClick={clearFilters}>Clear all filters</button>
            )}
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
                ) : filteredStudents.length === 0 ? (
                  <tr><td colSpan="6">No students found.</td></tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student._id || student.student_id}>
                      <td>{student.full_name}</td>
                      <td>{student.edu_level}</td>
                      <td>{student.batch}</td>
                      <td>{student.account_status ? 'Active' : 'Inactive'}</td>
                      <td>{student.email}</td>
                      <td className="text-right">
                        <button
                          className="action-btn delete-btn"
                          title="Delete"
                          onClick={() => handleDeleteStudent(student._id || student.student_id)}
                        >
                          🗑
                        </button>
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
    </div>
  );
}

export default StudentManagement;