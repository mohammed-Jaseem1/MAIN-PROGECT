// AddTeacherForm.jsx – Professional Redesign
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './style/AddTeacherForm.css';

/* ─── helpers ─── */
const generateEmployeeId = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TCH-${year}-${rand}`;
};

const generatePassword = () => {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$%&*!';
  const all = upper + lower + digits + special;
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

/* ─── Component ─── */
const AddTeacherForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar nav items
  const navItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Teachers', path: '/add-teacher' },
    { label: 'Students', path: '/student-management' },
    { label: 'Classes', path: '/courses' },
  ];

  /* ── form state ── */
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    joiningDate: '',
    employeeId: generateEmployeeId(),
    subjects: [],
    newSubject: '',
    qualifications: '',
    username: '',
    password: generatePassword(),
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [dateFocused, setDateFocused] = useState(false);
  const [toast, setToast] = useState(null);

  /* ── handlers ── */
  const showToast = (msg, duration = 3500) => {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+91')) val = '+91' + val.replace(/^\+91/, '');
    const digits = val.slice(3).replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, phone: '+91' + digits }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const handleAddSubject = () => {
    const sub = formData.newSubject.trim();
    if (sub && !formData.subjects.includes(sub)) {
      setFormData(prev => ({ ...prev, subjects: [...prev.subjects, sub], newSubject: '' }));
    }
  };

  const handleRemoveSubject = (s) =>
    setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(x => x !== s) }));

  /* ── validation ── */
  const validateForm = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email address';
    const phone = formData.phone.replace(/[-\s()]/g, '');
    if (!phone) e.phone = 'Phone number is required';
    else if (!/^\+91[987]\d{9}$/.test(phone)) e.phone = 'Must be +91 followed by 10 digits (starting 9/8/7)';
    if (!formData.joiningDate) e.joiningDate = 'Joining date is required';
    if (!formData.qualifications.trim()) e.qualifications = 'Qualifications are required';
    if (!formData.username.trim()) e.username = 'Username is required';
    // password is always auto-generated and valid — no manual validation needed
    return e;
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      joiningDate: formData.joiningDate,
      employeeId: formData.employeeId,
      subjects: formData.subjects,
      qualifications: formData.qualifications,
      username: formData.username,
      password: formData.password,
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/api/teacher/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add teacher');
      }
      const data = await res.json();
      setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        joiningDate: '', employeeId: generateEmployeeId(),
        subjects: [], newSubject: '', qualifications: '',
        username: '', password: generatePassword(),
      });
      setErrors({});
      if (data.emailWarning) {
        showToast(`⚠️ Teacher created! Note: ${data.emailWarning}`, 6000);
      } else {
        showToast(`🎉 Teacher registered! A welcome email with credentials has been sent to ${payload.email}.`);
      }
    } catch (err) {
      console.error(err);
      showToast(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="add-teacher-page">

      {/* ── Toast ── */}
      {toast && (
        <div className="at-toast-success" style={{
          background: toast.startsWith('❌') ? '#fee2e2' : '#dcfce7',
          borderColor: toast.startsWith('❌') ? '#dc2626' : '#16a34a',
          borderLeft: `5px solid ${toast.startsWith('❌') ? '#dc2626' : '#16a34a'}`,
          color: toast.startsWith('❌') ? '#991b1b' : '#166534',
        }}>
          <span style={{ flex: 1 }}>{toast}</span>
          <button onClick={() => setToast(null)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'inherit', fontSize: 18, opacity: 0.7, padding: '0 0 0 8px',
          }}>✕</button>
        </div>
      )}

      {/* ══ Sidebar ══ */}
      <aside style={{
        width: 220,
        minHeight: '100vh',
        background: '#1e293b',
        color: '#fff',
        position: 'fixed',
        top: 0, left: 0,
        zIndex: 1200,
        boxShadow: '2px 0 8px rgba(30,41,59,0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 12px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 40, height: 40, background: '#2563eb', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}>
            <span className="material-symbols-outlined">school</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>EduAdmin</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'block', width: '100%',
                padding: '10px 16px', borderRadius: 6,
                color: '#fff', fontWeight: 600,
                background: location.pathname === item.path ? '#2563eb' : 'transparent',
                marginBottom: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                boxShadow: location.pathname === item.path ? '0 2px 8px rgba(37,99,235,0.15)' : 'none',
                transition: 'background 0.2s',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Admin badge */}
        <div style={{
          marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(51,65,85,0.15)', borderRadius: 6, padding: '10px 12px',
        }}>
          <div style={{
            width: 32, height: 32, background: '#10b981', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700,
          }}>A</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Admin User</div>
            <div style={{ fontSize: 12, color: '#cbd5e1' }}>Super Admin</div>
          </div>
        </div>
      </aside>

      {/* ══ Main ══ */}
      <main className="add-teacher-main">
        <div className="add-teacher-inner">

          {/* Page header */}
          <div className="at-page-header">
            <nav className="at-breadcrumb">
              <a href="#" className="at-breadcrumb-link">Teachers</a>
              <span className="material-symbols-outlined at-breadcrumb-sep">chevron_right</span>
              <span className="at-breadcrumb-current">Add New Teacher</span>
            </nav>
            <h1>Register New Teacher</h1>
            <p className="at-page-subtitle">
              Fill in the details below to create a new teacher account and assign their profile.
            </p>
          </div>

          {/* ── FORM ── */}
          <form className="at-form" onSubmit={handleSubmit}>

            {/* ╔══ Personal Information ══╗ */}
            <div className="at-section">
              <div className="at-section-header">
                <div className="at-section-icon">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <span className="at-section-title">Personal Information</span>
              </div>
              <div className="at-section-body">
                <div className="at-grid">
                  {/* First Name */}
                  <div className="at-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text" id="firstName" name="firstName"
                      value={formData.firstName} onChange={handleChange}
                      placeholder="e.g. Rahul"
                      className={errors.firstName ? 'at-error' : ''}
                    />
                    {errors.firstName && <span className="at-error-msg">{errors.firstName}</span>}
                  </div>

                  {/* Last Name */}
                  <div className="at-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text" id="lastName" name="lastName"
                      value={formData.lastName} onChange={handleChange}
                      placeholder="e.g. Sharma"
                      className={errors.lastName ? 'at-error' : ''}
                    />
                    {errors.lastName && <span className="at-error-msg">{errors.lastName}</span>}
                  </div>

                  {/* Email */}
                  <div className="at-group at-col-full">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email" id="email" name="email"
                      value={formData.email} onChange={handleChange}
                      placeholder="teacher@school.edu"
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className={errors.email ? 'at-error' : ''}
                    />
                    {emailFocused && !errors.email && (
                      <span className="at-helper-text">Enter a valid email (e.g. name@example.com)</span>
                    )}
                    {errors.email && <span className="at-error-msg">{errors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div className="at-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel" id="phone" name="phone"
                      value={formData.phone} onChange={handlePhoneChange}
                      placeholder="+91XXXXXXXXXX"
                      onFocus={() => setPhoneFocused(true)}
                      onBlur={() => setPhoneFocused(false)}
                      maxLength={13}
                      className={errors.phone ? 'at-error' : ''}
                      style={{ letterSpacing: '0.04em' }}
                    />
                    {phoneFocused && !errors.phone && (
                      <span className="at-helper-text">Format: +91 followed by 10 digits starting with 9, 8 or 7</span>
                    )}
                    {errors.phone && <span className="at-error-msg">{errors.phone}</span>}
                  </div>

                  {/* Joining Date */}
                  <div className="at-group">
                    <label htmlFor="joiningDate">Joining Date</label>
                    <input
                      type="date" id="joiningDate" name="joiningDate"
                      value={formData.joiningDate} onChange={handleChange}
                      onFocus={() => setDateFocused(true)}
                      onBlur={() => setDateFocused(false)}
                      max={new Date().toISOString().split('T')[0]}
                      className={errors.joiningDate ? 'at-error' : ''}
                    />
                    {dateFocused && !errors.joiningDate && (
                      <span className="at-helper-text">Select the date the teacher joined (cannot be a future date)</span>
                    )}
                    {errors.joiningDate && <span className="at-error-msg">{errors.joiningDate}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* ╔══ Professional Details ══╗ */}
            <div className="at-section">
              <div className="at-section-header">
                <div className="at-section-icon">
                  <span className="material-symbols-outlined">work</span>
                </div>
                <span className="at-section-title">Professional Details</span>
              </div>
              <div className="at-section-body">
                <div className="at-grid">
                  {/* Employee ID */}
                  <div className="at-group">
                    <label htmlFor="employeeId">Employee ID</label>
                    <div className="at-id-box">
                      <input
                        type="text" id="employeeId" name="employeeId"
                        value={formData.employeeId}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="at-group">
                    <label htmlFor="qualifications">Qualifications</label>
                    <textarea
                      id="qualifications" name="qualifications"
                      value={formData.qualifications} onChange={handleChange}
                      placeholder="e.g. B.Ed, M.Sc Mathematics"
                      className={errors.qualifications ? 'at-error' : ''}
                      style={{ minHeight: 72 }}
                    />
                    {errors.qualifications && <span className="at-error-msg">{errors.qualifications}</span>}
                  </div>

                  {/* Subjects */}
                  <div className="at-group at-col-full">
                    <label>Subjects</label>
                    <div className="at-subjects-wrap">
                      {/* Tags */}
                      {formData.subjects.length > 0 && (
                        <div className="at-tags">
                          {formData.subjects.map(s => (
                            <span key={s} className="at-tag">
                              {s}
                              <button
                                type="button" className="at-tag-remove"
                                onClick={() => handleRemoveSubject(s)}
                              >✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Input row */}
                      <div className="at-subject-input-row">
                        <input
                          type="text"
                          value={formData.newSubject}
                          placeholder="Type a subject and press Add"
                          onChange={e => setFormData(prev => ({ ...prev, newSubject: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                        />
                        <button type="button" className="at-add-subject-btn" onClick={handleAddSubject}>
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ╔══ Account Setup ══╗ */}
            <div className="at-section">
              <div className="at-section-header">
                <div className="at-section-icon">
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <span className="at-section-title">Account Setup</span>
              </div>
              <div className="at-section-body">
                <div className="at-grid">
                  {/* Username */}
                  <div className="at-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text" id="username" name="username"
                      value={formData.username} onChange={handleChange}
                      placeholder="e.g. rahul.sharma"
                      className={errors.username ? 'at-error' : ''}
                    />
                    {errors.username && <span className="at-error-msg">{errors.username}</span>}
                  </div>

                  {/* Password — auto-generated */}
                  <div className="at-group">
                    <label htmlFor="password">Initial Password</label>
                    <div className="at-pwd-wrap">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password" name="password"
                        value={formData.password}
                        readOnly
                        style={{
                          letterSpacing: showPassword ? 'normal' : '0.12em',
                          background: '#f1f5f9',
                          cursor: 'default',
                          paddingRight: '90px',
                        }}
                      />
                      {/* Eye toggle */}
                      <button
                        type="button"
                        className="at-pwd-toggle"
                        onClick={() => setShowPassword(p => !p)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                        style={{ right: 40 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                      {/* Regenerate button */}
                      <button
                        type="button"
                        className="at-pwd-toggle"
                        onClick={() => setFormData(prev => ({ ...prev, password: generatePassword() }))}
                        title="Generate new password"
                        style={{ right: 0 }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>refresh</span>
                      </button>
                    </div>
                    <small style={{ color: '#64748b', fontSize: '0.82em', marginTop: 3 }}>
                      🔒 Auto-generated — will be sent to the teacher's email.
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="at-form-actions">
              <button
                type="button" className="at-cancel-btn"
                onClick={() => navigate('/admin')}
              >
                Cancel
              </button>
              <button
                type="submit" className="at-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><span className="at-spinner" /> Adding Teacher…</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span> Add Teacher</>
                )}
              </button>
            </div>
          </form>

          {/* Help tip */}
          <div className="at-help-tip">
            <div className="at-help-icon">
              <span className="material-symbols-outlined">info</span>
            </div>
            <div className="at-help-content">
              <h4>Quick Tip</h4>
              <p>The teacher account will be immediately active. You can manage subject assignments and class linking from the teacher profile later.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="at-footer">
          <div className="at-footer-content">
            <div className="at-footer-left">
              <span className="material-symbols-outlined at-footer-logo">school</span>
              <span>EduAdmin System</span>
              <span className="at-footer-divider">|</span>
              <span>© 2024 Educational Platform. All rights reserved.</span>
            </div>
            <div className="at-footer-links">
              <a href="#" className="at-footer-link">Privacy Policy</a>
              <a href="#" className="at-footer-link">Terms of Service</a>
              <a href="#" className="at-footer-link">Cookie Settings</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AddTeacherForm;