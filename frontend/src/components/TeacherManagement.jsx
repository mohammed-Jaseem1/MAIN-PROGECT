// TeacherManagement.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import './style/TeacherManagement.css';

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [selectedSubject, setSelectedSubject] = useState('ALL SUBJECTS');
  const [teachers, setTeachers] = useState([
    
  ]);
  const navigate = useNavigate(); // Add this line

  const subjects = ['ALL SUBJECTS', '', 'HUMANITIES', '', 'PHYSICAL ED'];
  const departments = ['All Departments', 'Science & Logic Dept', 'Humanities Dept', 'Arts Dept', 'Physical Education Dept'];
  const statuses = ['Status', 'ACTIVE', 'ON LEAVE', 'INACTIVE', 'PENDING'];

  const stats = {
    totalTeachers: '',
    activeNow: '',
    openPositions: '',
    growthRate: '',
    engagementRate: '',
    urgentRequirements: '',
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddTeacher = () => {
    navigate('/add-teacher'); // Navigate to AddTeacherForm page
  };

  const handleEditTeacher = (teacherId) => {
    alert(`Edit teacher with ID: ${teacherId}`);
    // Implement edit logic
  };

  const handleDeleteTeacher = (teacherId) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter(teacher => teacher.id !== teacherId));
    }
  };

  const handleViewDetails = (teacherId) => {
    alert(`View details for teacher ID: ${teacherId}`);
    // Implement view details logic
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = searchTerm === '' || 
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'All Departments' || 
      teacher.department === selectedDepartment;
    
    const matchesStatus = selectedStatus === 'Status' || 
      teacher.status === selectedStatus;

    const matchesSubject = selectedSubject === 'ALL SUBJECTS' || 
      teacher.subject.toUpperCase().includes(selectedSubject);

    return matchesSearch && matchesDepartment && matchesStatus && matchesSubject;
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
    <div className="teacher-management">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h1 className="admin-title">EduAdmin Pro</h1>
          <h2 className="admin-subtitle">ADMIN SUITE</h2>
        </div>
        <nav className="sidebar-nav">
          <button className="sidebar-btn active">Dashboard</button>
          <button className="sidebar-btn">Teachers</button>
          <button className="sidebar-btn">Classes</button>
          <button className="sidebar-btn">Schedule</button>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">admin</div>
        </div>
      </aside>

      <div className="main-content">
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

          <div className="stat-card">
            <div className="stat-header">
              <h3>Open Positions</h3>
              <span className="stat-trend urgent">
                ⚠ {stats.urgentRequirements} urgent requirements
              </span>
            </div>
            <div className="stat-value">{stats.openPositions}</div>
            <div className="stat-icon">©</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-container">
          <div className="search-box">
            <span className="search-icon">Q</span>
            <input
              type="text"
              placeholder="Search by name, subject or ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>

          <div className="filter-dropdowns">
            <select 
              className="filter-select"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select 
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
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
                <th>DEPARTMENT</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
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
                    <span className="department">{teacher.department}</span>
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
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(teacher.id)}
                        title="View Details"
                      >
                        👁
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditTeacher(teacher.id)}
                        title="Edit"
                      >
                        ✓
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        title="Delete"
                      >
                        ☑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="table-footer">
          <div className="pagination-info">
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled>← Previous</button>
            <span className="page-numbers">Page 1 of 31</span>
            <button className="pagination-btn">Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherManagement;