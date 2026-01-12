import React, { useState } from 'react';
import './style/ManageExams.css';

const ManageExams = () => {
  const [filters, setFilters] = useState({
    subject: 'All Subjects',
    status: 'All Statuses'
  });

  const [exams, setExams] = useState([
    
  ]);

  const [activeFilters, setActiveFilters] = useState([]);

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
    switch (status.toLowerCase()) {
      case 'ongoing': return 'status-ongoing';
      case 'published': return 'status-published';
      case 'completed': return 'status-completed';
      case 'draft': return 'status-draft';
      default: return '';
    }
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
                setFilters({...filters, subject: e.target.value});
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
                setFilters({...filters, status: e.target.value});
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
                  <td className="participation-cell">{exam.participation}</td>
                  <td>
                    <button className={`action-btn action-${exam.actions.toLowerCase()}`}>
                      {exam.actions}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing-info">
            Showing 1 to {exams.length} of 24 exams
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
    </div>
  );
};

export default ManageExams;