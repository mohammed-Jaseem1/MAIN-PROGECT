import React, { useState, useEffect, useCallback } from 'react';
import './style/Addstudent.css';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Auto-generate a strong random password ──────────────────────────────────
const generatePassword = () => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$%&*!';
  const all = upper + lower + digits + special;
  // Guarantee at least one of each category
  const pick = (set) => set[Math.floor(Math.random() * set.length)];
  const rand = Array.from({ length: 6 }, () => pick(all));
  const pwd = [pick(upper), pick(lower), pick(digits), pick(special), ...rand];
  // Fisher-Yates shuffle
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }
  return pwd.join('');
};

function AddStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    student_id: '',
    edu_level: '',
    post: '',
    account_status: true,
    full_name: '',
    email: '',
    password: generatePassword(),
    phone: '',
    batch: '',
  });

  const [phoneError, setPhoneError] = useState('');
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error'|'warning', message: '' }

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (type, message, duration = 5000) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), duration);
  };

  useEffect(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({
      ...prev,
      student_id: `STU-${year}-${randomNum}`
    }));
  }, []);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id === 'phone') {
      let phoneValue = value;
      // Ensure phone always starts with +91
      if (!phoneValue.startsWith('+91')) {
        phoneValue = '+91' + phoneValue.replace(/^\+?91?/, '');
      }
      // Validate phone number: +91, starts with 9/8/7, 10 digits
      const phonePattern = /^\+91[987]\d{9}$/;
      if (phoneValue === '' || phonePattern.test(phoneValue)) {
        setPhoneError('');
      } else {
        setPhoneError('Phone must be +91 and start with 9, 8, or 7 and have 10 digits');
      }
      setFormData(prev => ({
        ...prev,
        [id]: phoneValue
      }));
    } else if (id === 'edu_level') {
      setFormData(prev => ({
        ...prev,
        edu_level: value,
        post: '' // Reset post when level changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate phone before submit
    const phonePattern = /^\+91[987]\d{9}$/;
    if (!phonePattern.test(formData.phone)) {
      setPhoneError('Phone must be +91 and start with 9, 8, or 7 and have 10 digits');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.emailWarning) {
          showToast('warning', `✅ Student account created! ⚠️ ${data.emailWarning}`);
        } else {
          showToast('success', `🎉 Account created! A welcome email with login credentials has been sent to ${formData.email}.`);
        }
        // Reset form with a new student_id and a fresh auto-generated password
        const year = new Date().getFullYear();
        const randomNum = Math.floor(100 + Math.random() * 900);
        setFormData({
          student_id: `STU-${year}-${randomNum}`,
          edu_level: '', post: '', account_status: true,
          full_name: '', email: '', password: generatePassword(), phone: '', batch: '',
        });
      } else {
        showToast('error', `❌ Error: ${data.error || 'Could not create student account.'}`);
      }
    } catch (err) {
      showToast('error', `❌ Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Handle cancel action
    console.log('Form cancelled');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Sidebar nav items
  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Students', path: '/student-management' },
    { label: 'Batches', path: '/batches' },
    { label: 'Courses', path: '/courses' }
  ];

  // Posts by level
  const postsByLevel = {
    '10th': [
      'Last Grade Servant (LGS)',
      'Office Attendant / Secretariat Office Attendant',
      'Lower Division Clerk (LDC)',
      'Village Field Assistant (VFA)',
      'Police Constable',
      'Assistant Prison Officer',
      'Junior Assistant',
      'Typist / Typist Clerk',
      'Data Entry Operator',
      'Stenographer',
      'Store Keeper',
      'Peon / Attender',
      'Binder',
      'Field Worker',
      'Laboratory Assistant',
      'Light Keeper and Signaller'
    ],
    '12th': [
      'Civil Police Officer (CPO) / Women Civil Police Officer (WCPO)',
      'Police Constable / Women Police Constable',
      'Fireman / Firewoman (Trainee)',
      'Civil Excise Officer / Women Civil Excise Officer',
      'Beat Forest Officer',
      'Computer Assistant Grade II',
      'Confidential Assistant Grade II',
      'Typist Clerk',
      'Office Assistant',
      'Meter Reader',
      'Stenographer',
      'Assistant (Kerala Administrative Tribunal)',
      'Inspecting Assistant (Legal Metrology)'
    ],
    'degree': [
      'Secretariat Assistant / University Assistant',
      'Deputy Collector',
      'Sales Tax Officer',
      'Junior Employment Officer',
      'Panchayat Secretary',
      'Block Development Officer',
      'Sub Inspector of Police / Armed Police Sub Inspector (Trainee)',
      'Excise Inspector (Trainee)',
      'Assistant Jailor Grade I',
      'Divisional Accountant',
      'Assistant / Data Entry Operator / Typist Clerk Grade II',
      'Section Officer (Kerala PSC)',
      'Sales Assistant / Sales Assistant Grade II',
      'Special Branch Assistant (SBCID)',
      'Assistant Director of National Savings',
      'Junior Manager (General)',
      'Junior Receptionist',
      'Kerala Administrative Service (KAS) Officer'
    ]
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          maxWidth: 420, minWidth: 280,
          background: toast.type === 'success' ? '#dcfce7'
            : toast.type === 'warning' ? '#fef9c3'
              : '#fee2e2',
          border: `1.5px solid ${toast.type === 'success' ? '#16a34a'
            : toast.type === 'warning' ? '#d97706'
              : '#dc2626'}`,
          borderLeft: `5px solid ${toast.type === 'success' ? '#16a34a'
            : toast.type === 'warning' ? '#d97706'
              : '#dc2626'}`,
          borderRadius: 12,
          padding: '16px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          fontSize: 14,
          fontWeight: 500,
          color: toast.type === 'success' ? '#166534'
            : toast.type === 'warning' ? '#92400e'
              : '#991b1b',
          lineHeight: 1.6,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          animation: 'slideInToast 0.3s ease'
        }}>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'inherit', fontSize: 18, lineHeight: 1, opacity: 0.7,
              padding: '0 0 0 8px', flexShrink: 0
            }}
          >✕</button>
        </div>
      )}
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
      <div style={{ padding: 0 }}>
        {/* Removed back button */}
        <main className="add-student-main-content">
          <div style={{ width: '100%', paddingLeft: '220px' }}>
            <div className="page-header">
              <nav className="breadcrumb">
                <a href="#" className="breadcrumb-link">Students</a>
                <span className="material-symbols-outlined breadcrumb-separator">chevron_right</span>
                <span className="breadcrumb-current">Add New Student</span>
              </nav>
              <h1>Register New Student</h1>
              <p className="subtitle">
                Fill in the details below to create a new student account and assign them to a batch.
              </p>
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
                      <input
                        type="text"
                        id="student_id"
                        value={formData.student_id}
                        onChange={handleChange}
                        placeholder="e.g. STU-2024-001"
                        style={{ flex: 1 }}
                        readOnly
                      />
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
                    {/* Post Applying For */}
                    <div className="form-group">
                      <label htmlFor="post">Post Applying For</label>
                      <select
                        id="post"
                        value={formData.post}
                        onChange={handleChange}
                        disabled={!formData.edu_level}
                      >
                        <option value="">Select Post</option>
                        {postsByLevel[formData.edu_level]?.map(post => (
                          <option key={post} value={post}>{post}</option>
                        ))}
                      </select>
                      {formData.edu_level && (
                        <small style={{ color: '#64748b', fontSize: '0.9em' }}>
                          {formData.edu_level === '10th' && 'Source: Kerala PSC 10th Level Exams, Unacademy'}
                          {formData.edu_level === '12th' && 'Source: Kerala PSC 12th Level Exams, Testbook, Unacademy'}
                          {formData.edu_level === 'degree' && 'Source: Kerala PSC Degree Level Exams'}
                        </small>
                      )}
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
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                      {(emailFocused || formData.email) && (
                        <small style={{ color: '#2563eb', fontSize: '0.9em' }}>
                          Please enter a valid institutional email address (e.g. student@gmail.com)
                        </small>
                      )}
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
                        onFocus={() => setPhoneFocused(true)}
                        onBlur={() => setPhoneFocused(false)}
                      />
                      {(phoneFocused || formData.phone) && (
                        <>
                          {phoneError && <span className="error-message" style={{ color: 'red', fontSize: '0.9em' }}>{phoneError}</span>}
                          <small>Format: +91XXXXXXXXXX (starts with 9, 8, or 7)</small>
                        </>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">Initial Password</label>
                      <div className="password-input">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={formData.password}
                          readOnly
                          style={{ letterSpacing: showPassword ? 'normal' : '0.12em', background: '#f1f5f9', cursor: 'default' }}
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          <span className="material-symbols-outlined">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setFormData(prev => ({ ...prev, password: generatePassword() }))}
                          title="Generate new password"
                          style={{ marginLeft: 2 }}
                        >
                          <span className="material-symbols-outlined">refresh</span>
                        </button>
                      </div>
                      <small style={{ color: '#64748b', fontSize: '0.85em', marginTop: 4 }}>
                        🔒 Auto-generated — this password will be emailed to the student.
                      </small>
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
                <button type="submit" className="submit-btn" disabled={isSubmitting}
                  style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  <span className="material-symbols-outlined">
                    {isSubmitting ? 'hourglass_top' : 'person_add'}
                  </span>
                  {isSubmitting ? 'Sending...' : 'Create Account'}
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

export default AddStudent;