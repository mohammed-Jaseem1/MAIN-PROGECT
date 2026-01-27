import React, { useState } from 'react';
import './style/Addstudent.css';

function AddStudent() {
  const [formData, setFormData] = useState({
    student_id: '',
    edu_level: '',
    account_status: true,
    full_name: '',
    email: '',
    password: '',
    phone: '',
    batch: '',
  });

  const [phoneError, setPhoneError] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id === 'phone') {
      // Validate phone number: +91, starts with 9/8/7, 10 digits
      const phonePattern = /^\+91[987]\d{9}$/;
      if (value === '' || phonePattern.test(value)) {
        setPhoneError('');
      } else {
        setPhoneError('Phone must be +91 and start with 9, 8, or 7 and have 10 digits');
      }
    }
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate phone before submit
    const phonePattern = /^\+91[987]\d{9}$/;
    if (!phonePattern.test(formData.phone)) {
      setPhoneError('Phone must be +91 and start with 9, 8, or 7 and have 10 digits');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        alert('Student added successfully!');
        // Optionally reset form or redirect
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };

  const handleCancel = () => {
    // Handle cancel action
    console.log('Form cancelled');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const generateStudentId = () => {
    // Example: STU-YYYY-NNN (random 3 digits)
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({
      ...prev,
      student_id: `STU-${year}-${randomNum}`
    }));
  };

  return (
    <div className="add-student-container">
      {/* Back Button */}
      <button
        type="button"
        className="back-btn"
        style={{
          position: 'absolute',
          top: 24,
          left: 32,
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 18px',
          cursor: 'pointer',
          fontWeight: 600,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
        onClick={() => window.history.back()}
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Back
      </button>
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
        <div className="page-header">
          <nav className="breadcrumb">
            <a href="#" className="breadcrumb-link">Students</a>
            <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
            <span className="breadcrumb-current">Add New Student</span>
          </nav>
          <h1>Register New Student</h1>
          <p className="subtitle">Fill in the details below to create a new student account and assign them to a batch.</p>
        </div>

        <form className="student-form" onSubmit={handleSubmit}>
          {/* Account Information Section */}
          <div className="form-section">
            <div className="form-section-header">
              <h3>
                <span className="material-symbols-outlined">account_circle</span>
                Account Information
              </h3>
            </div>
            <div className="form-section-content">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="student_id">Student ID / Roll No</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      id="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      placeholder="e.g. STU-2024-001"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className="generate-btn"
                      onClick={generateStudentId}
                      style={{ padding: '0 12px' }}
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="edu_level">Education Level</label>
                  <select
                    id="edu_level"
                    value={formData.edu_level}
                    onChange={handleChange}
                  >
                    <option value="">Select Level</option>
                    <option value="10th">10th Grade</option>
                    <option value="12th">12th Grade</option>
                    <option value="degree">Degree</option>
                  </select>
                </div>
                <div className="toggle-container">
                  <div className="toggle-wrapper">
                    <input
                      type="checkbox"
                      id="account_status"
                      className="toggle-checkbox"
                      checked={formData.account_status}
                      onChange={handleChange}
                    />
                    <label htmlFor="account_status" className="toggle-label"></label>
                  </div>
                  <div className="toggle-text">
                    <span className="toggle-title">Account Status</span>
                    <p className="toggle-description">Student will have immediate access to the portal if active.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details Section */}
          <div className="form-section">
            <div className="form-section-header">
              <h3>
                <span className="material-symbols-outlined">badge</span>
                Personal Details
              </h3>
            </div>
            <div className="form-section-content">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="full_name">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Enter student's full legal name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email / Username</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.edu"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="text"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+919876543210"
                    maxLength={13}
                  />
                  {phoneError && <span className="error-message" style={{color:'red', fontSize:'0.9em'}}>{phoneError}</span>}
                  <small>Format: +91XXXXXXXXXX (starts with 9, 8, or 7)</small>
                </div>
                <div className="form-group">
                  <label htmlFor="password">Initial Password</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="form-section">
            <div className="form-section-header">
              <h3>
                <span className="material-symbols-outlined">groups</span>
                Assignment
              </h3>
            </div>
            <div className="form-section-content">
              <div className="form-group">
                <label htmlFor="batch">Select Batch</label>
                <select
                  id="batch"
                  value={formData.batch}
                  onChange={handleChange}
                >
                  <option value="">Assign to a Batch</option>
                  <option value="morning_alpha">Morning Alpha (08:00 AM - 12:00 PM)</option>
                  <option value="afternoon_gamma">Afternoon Gamma (01:00 PM - 05:00 PM)</option>
                  <option value="evening_beta">Evening Beta (06:00 PM - 09:00 PM)</option>
                </select>
                <p className="form-note">
                  Note: You can re-assign batches later from the student profile.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <span className="material-symbols-outlined">person_add</span>
              Create Account
            </button>
          </div>
        </form>

        {/* Help Tip */}
        <div className="help-tip">
          <div className="help-icon">
            <span className="material-symbols-outlined">info</span>
          </div>
          <div className="help-content">
            <h4>Quick Tip</h4>
            <p>The student will receive an automated email with their login credentials once the account is created.</p>
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

export default AddStudent;