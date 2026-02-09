// AddTeacherForm.jsx
import React, { useState } from 'react';
import './style/AddTeacherForm.css';

const generateEmployeeId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TCH-${year}-${random}`;
};

const AddTeacherForm = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    joiningDate: '',
    
    // Professional Details
    employeeId: generateEmployeeId(),
    subjects: [],
    newSubject: '',
    qualifications: '',
    
    // Account Setup
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [joiningDateFocused, setJoiningDateFocused] = useState(false);
  // Add success message state
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddSubject = () => {
    if (formData.newSubject.trim() && !formData.subjects.includes(formData.newSubject.trim())) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, prev.newSubject.trim()],
        newSubject: ''
      }));
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject !== subjectToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    // Phone validation: +91, starts with 9/8/7, 10 digits (robust)
    const phoneRaw = formData.phone.trim();
    const phone = phoneRaw.replace(/[-\s()]/g, '');
    // Debug: log processed phone and regex result
    console.log('Phone input:', formData.phone, 'Processed:', phone, 'Regex test:', /^\+91[987]\d{9}$/.test(phone));
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+91[987]\d{9}$/.test(phone)) {
      newErrors.phone = 'Phone must start with +91 and be a valid 10-digit number starting with 9, 8, or 7';
    }

    if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';

    if (!formData.qualifications.trim()) newErrors.qualifications = 'Qualifications are required';

    // Account setup validation
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);

    const teacherData = {
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
      const response = await fetch('http://127.0.0.1:5000/api/teacher/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add teacher');
      }

      setIsSubmitting(false);
      // Custom success message instead of alert
      setFormData({
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
        password: '',
      });
      setErrors({});
      // Show custom success message
      setSuccessMsg("Teacher registered successfully! 🎉");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      console.error('Error adding teacher:', error);
      setIsSubmitting(false);
      alert('Failed to add teacher. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Phone input handler: always keep "+91", allow only 10 digits after
  const handlePhoneChange = (e) => {
    let value = e.target.value;

    // Always start with "+91"
    if (!value.startsWith("+91")) {
      value = "+91" + value.replace(/^\+91/, "");
    }

    // Remove non-digit characters after "+91"
    let digits = value.slice(3).replace(/\D/g, "");
    // Limit to 10 digits
    digits = digits.slice(0, 10);

    setFormData(prev => ({
      ...prev,
      phone: "+91" + digits
    }));

    if (errors.phone) {
      setErrors(prev => ({
        ...prev,
        phone: ''
      }));
    }
  };

  return (
    <div
      className="add-teacher-bg"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f0f4f8 0%, #e3e9f3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 0"
      }}
    >
      <div
        className="add-teacher-container"
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
        }}
      >
        {/* Back Button */}
        <button
          className="back-btn"
          onClick={() => window.history.back()}
          style={{
            position: "absolute",
            top: 24,
            left: 32,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 18px",
            cursor: "pointer",
            fontWeight: 600,
            zIndex: 10,
            boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
            transition: "background 0.2s, color 0.2s",
          }}
        >
          ← Back
        </button>

        <h1
          style={{
            marginTop: 24,
            marginBottom: 4,
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.5rem",
            color: "#1e293b",
            letterSpacing: "0.5px"
          }}
        >
          Teacher Registration
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: 12,
            fontSize: "1rem"
          }}
        >
          Please fill in the details below to register a new teacher.
        </p>

        <form
          onSubmit={handleSubmit}
          className="teacher-form"
          style={{
            border: "none",
            borderRadius: "12px",
            maxWidth: "900px",
            margin: "0 auto",
            padding: "16px 12px",
            background: "#fff",
            boxShadow: "0 4px 16px rgba(30,41,59,0.10)",
            position: "relative",
            minWidth: 0,
          }}
        >
          {/* Show custom success message */}
          {successMsg && (
            <div
              style={{
                marginBottom: 8,
                padding: "8px",
                background: "#e0f7fa",
                color: "#2563eb",
                borderRadius: "6px",
                textAlign: "center",
                fontWeight: 600,
                fontSize: "1em",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
            >
              {successMsg}
            </div>
          )}

          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            {/* Personal Information Section */}
            <section className="form-section" style={{ flex: 1, minWidth: 320 }}>
              <div className="section-header" style={{ marginBottom: 8 }}>
                <h2 style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#2563eb",
                  marginBottom: 2,
                  letterSpacing: "0.2px"
                }}>Personal Information</h2>
                <div className="section-divider" style={{
                  height: 2,
                  width: 32,
                  background: "#2563eb",
                  borderRadius: 2,
                  marginBottom: 2
                }}></div>
              </div>
              <div className="form-row" style={{ display: "flex", gap: "8px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder=""
                    className={errors.firstName ? 'error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder=""
                    className={errors.lastName ? 'error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder=""
                  className={errors.email ? 'error' : ''}
                />
                {emailFocused && (
                  <span
                    className="helper-text"
                    style={{
                      color: '#2563eb',
                      fontSize: '1em',
                      fontWeight: 600,
                      marginTop: 4,
                      display: 'block'
                    }}
                  >
                    Enter a valid email address (e.g., name@example.com)
                  </span>
                )}
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-row" style={{ display: "flex", gap: "8px" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    placeholder="+91XXXXXXXXXX"
                    className={errors.phone ? 'error' : ''}
                    maxLength={13} // "+91" + 10 digits
                    style={{
                      letterSpacing: '0.05em'
                    }}
                  />
                  {phoneFocused && (
                    <span
                      className="helper-text"
                      style={{
                        color: '#2563eb',
                        fontSize: '1em',
                        fontWeight: 600,
                        marginTop: 4,
                        display: 'block'
                      }}
                    >
                      Format: +91 followed by 10 digits starting with 9, 8, or 7 (e.g., +919876543210)
                    </span>
                  )}
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="joiningDate">Joining Date</label>
                  <input
                    type="date"
                    id="joiningDate"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    onFocus={() => setJoiningDateFocused(true)}
                    onBlur={() => setJoiningDateFocused(false)}
                    className={errors.joiningDate ? 'error' : ''}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {joiningDateFocused && (
                    <span
                      className="helper-text"
                      style={{
                        color: '#2563eb',
                        fontSize: '1em',
                        fontWeight: 600,
                        marginTop: 4,
                        display: 'block'
                      }}
                    >
                      Select the date the teacher joined (cannot be a future date)
                    </span>
                  )}
                  {errors.joiningDate && <span className="error-message">{errors.joiningDate}</span>}
                </div>
              </div>
            </section>

            {/* Professional Details Section */}
            <section className="form-section" style={{ flex: 1, minWidth: 320 }}>
              <div className="section-header" style={{ marginBottom: 8 }}>
                <h2 style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#2563eb",
                  marginBottom: 2,
                  letterSpacing: "0.2px"
                }}>Professional Details</h2>
                <div className="section-divider" style={{
                  height: 2,
                  width: 32,
                  background: "#2563eb",
                  borderRadius: 2,
                  marginBottom: 2
                }}></div>
              </div>
              <div className="form-group">
                <label htmlFor="employeeId">Employee ID</label>
                <div className="employee-id-container">
                  <input
                    type="text"
                    id="employeeId"
                    name="employeeId"
                    value={formData.employeeId}
                    readOnly // make it read-only
                    className="employee-id-input"
                  />
                  {/* Remove Generate New button */}
                </div>
              </div>
              <div className="form-group">
                <label>Subjects</label>
                <div className="subjects-container">
                  <div className="subjects-list">
                    {formData.subjects.map(subject => (
                      <span key={subject} className="subject-tag">
                        {subject}
                        <button 
                          type="button" 
                          className="remove-subject-btn"
                          onClick={() => handleRemoveSubject(subject)}
                        >
                         
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="add-subject-input">
                    <input
                      type="text"
                      value={formData.newSubject}
                      onChange={(e) => setFormData(prev => ({ ...prev, newSubject: e.target.value }))}
                      placeholder="Add a subject"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                    />
                    <button 
                      type="button" 
                      className="add-subject-btn"
                      onClick={handleAddSubject}
                    >
                      + Add Subject
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="qualifications">Qualifications</label>
                <textarea
                  id="qualifications"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  placeholder=""
                  rows="3"
                  className={errors.qualifications ? 'error' : ''}
                />
                {errors.qualifications && <span className="error-message">{errors.qualifications}</span>}
              </div>
            </section>

            {/* Account Setup Section */}
            <section className="form-section" style={{ flex: 1, minWidth: 320 }}>
              <div className="section-header" style={{ marginBottom: 8 }}>
                <h2 style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#2563eb",
                  marginBottom: 2,
                  letterSpacing: "0.2px"
                }}>Account Setup</h2>
                <div className="section-divider" style={{
                  height: 2,
                  width: 32,
                  background: "#2563eb",
                  borderRadius: 2,
                  marginBottom: 2
                }}></div>
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder=""
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder=""
                      className={errors.password ? 'error' : ''}
                    />
                    <button 
                      type="button" 
                      className="toggle-password-btn"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? '👁' : '👁'}
                    </button>
                  </div>
                  {passwordFocused && (
                    <span
                      className="helper-text"
                      style={{
                        color: '#2563eb',
                        fontSize: '1em',
                        fontWeight: 600,
                        marginTop: 4,
                        display: 'block'
                      }}
                    >
                      Password must be at least 8 characters
                    </span>
                  )}
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
              </div>
            </section>
          </div>

          {/* Form Actions */}
          <div className="form-actions" style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: 12
          }}>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => window.history.back()}
              style={{
                background: "#f3f4f6",
                color: "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                padding: "10px 22px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? "#93c5fd" : "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "10px 28px",
                fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.10)",
                transition: "background 0.2s",
                fontSize: "1.08rem"
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Adding Teacher...
                </>
              ) : (
                'Add Teacher'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacherForm;