// TeacherManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import './style/TeacherManagement.css';

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // Remove department and status state
  const [selectedSubject, setSelectedSubject] = useState('ALL SUBJECTS');
  const [teachers, setTeachers] = useState([]);
  const navigate = useNavigate(); // Add this line

  const subjects = ['ALL SUBJECTS', 'GENERAL KNOWLEDGE', 'MATHS', , 'ENGLISH'];
  const departments = ['All Departments', 'Science & Logic Dept', 'Humanities Dept', 'Arts Dept', 'Physical Education Dept'];
  const statuses = ['Status', 'ACTIVE', 'ON LEAVE', 'INACTIVE', 'PENDING'];

  const [stats, setStats] = useState({
    totalTeachers: '',
    activeNow: '',
    growthRate: '',
    engagementRate: '',
    urgentRequirements: '',
  });

  useEffect(() => {
    fetch('/api/teacher')
      .then(res => res.json())
      .then(data => {
        // Map backend fields to frontend expected fields
        const mappedTeachers = data.map(teacher => ({
          id: teacher._id,
          name: teacher.firstName + ' ' + teacher.lastName,
          email: teacher.email,
          subject: teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects.join(', ') : '',
          department: teacher.department || '', // You may need to add department to your model
          status: teacher.status || 'ACTIVE', // You may need to add status to your model
          avatarColor: '#3b82f6', // Or generate based on name
        }));
        setTeachers(mappedTeachers);
      })
      .catch(err => console.error('Error fetching teachers:', err));

    // Fetch total teachers
    fetch('/api/teacher/count')
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({ ...prev, totalTeachers: data.total }));
      })
      .catch(err => console.error('Error fetching total teacher count:', err));

    // Fetch active teachers
    fetch('/api/teacher/active-count')
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({ ...prev, activeNow: data.active }));
      })
      .catch(err => console.error('Error fetching active teacher count:', err));
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddTeacher = () => {
    navigate('/add-teacher'); // Navigate to AddTeacherForm page
  };

  const handleDeleteTeacher = (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter(teacher => teacher.id !== teacherId));
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = searchTerm === '' || 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'ALL SUBJECTS' || 
      teacher.subject.toUpperCase().includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return '#10b981';
      case 'ON LEAVE': return '#f59e0b';
      case 'INACTIVE': return '#6b7280';
      case 'PENDING': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="teacher-management" style={{ display: 'flex', minHeight: '100vh' }}>
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
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              borderRadius: 6,
              color: '#fff',
              fontWeight: 600,
              background: '#2563eb',
              marginBottom: 8,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.15)'
            }}
          >
            Teachers
          </button>
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              borderRadius: 6,
              color: '#fff',
              fontWeight: 600,
              background: 'transparent',
              marginBottom: 8,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/student-management')}
          >
            Students
          </button>
          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '10px 16px',
              borderRadius: 6,
              color: '#fff',
              fontWeight: 600,
              background: 'transparent',
              marginBottom: 8,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Classes
          </button>
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
      <div className="main-content" style={{ marginLeft: 230 }}>
        {/* Page Header */}
        <div className="page-header">
          <h1>Teacher Management</h1>
          <div className="page-actions">
            <button className="add-teacher-btn" onClick={handleAddTeacher}>
              <span className="plus-icon">+</span> Add New Teacher
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-header">
              <h3>Total Teachers</h3>
              <span className="stat-trend positive">~ {stats.growthRate} since last term</span>
            </div>
            <div className="stat-value">{stats.totalTeachers}</div>
            <div className="stat-icon">👥</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <h3>Active Now</h3>
              <span className="stat-trend">
                <span className="status-dot active"></span> {stats.engagementRate} engagement rate
              </span>
            </div>
            <div className="stat-value">{stats.activeNow}</div>
            <div className="stat-icon">●</div>
          </div>

          {/* Removed Open Positions stat card */}
        </div>

        {/* Filters and Search */}
        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, subject or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>

        {/* Subject Tabs */}
        <div className="subject-tabs">
          {subjects.map(subject => (
            <button
              key={subject}
              className={`subject-tab ${selectedSubject === subject ? 'active' : ''}`}
              onClick={() => setSelectedSubject(subject)}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Teachers Table */}
        <div className="teachers-table-container">
          <table className="teachers-table">
            <thead>
              <tr>
                <th>TEACHER NAME</th>
                <th>SUBJECT SPECIALIZATION</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id}>
                  <td>
                    <div className="teacher-info">
                      <div 
                        className="teacher-avatar"
                        style={{ backgroundColor: teacher.avatarColor }}
                      >
                        {getInitials(teacher.name)}
                      </div>
                      <div className="teacher-details">
                        <div className="teacher-name">{teacher.name}</div>
                        <div className="teacher-email">{teacher.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="subject-badge">{teacher.subject}</span>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(teacher.status)}20`,
                        color: getStatusColor(teacher.status)
                      }}
                    >
                      <span 
                        className="status-dot"
                        style={{ backgroundColor: getStatusColor(teacher.status) }}
                      ></span>
                      {teacher.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {/* Removed table-footer section */}
      </div>
    </div>
  );
};

export default TeacherManagement;