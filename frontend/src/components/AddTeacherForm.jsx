// AddTeacherForm.jsx
import React, { useState } from 'react';
import './style/AddTeacherForm.css';

const AddTeacherForm = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    joiningDate: '',
    
    // Professional Details
    employeeId: 'TCH-2023-001',
    subjects: [],
    newSubject: '',
    qualifications: '',
    
    // Account Setup
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';
    
    if (!formData.qualifications.trim()) newErrors.qualifications = 'Qualifications are required';
    
    // Account setup validation
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
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
      alert('Teacher added successfully!');
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
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error adding teacher:', error);
      setIsSubmitting(false);
      alert('Failed to add teacher. Please try again.');
    }
  };

  const generateEmployeeId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TCH-${year}-${random}`;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="add-teacher-container">
      <div className="form-header">
        <h1>Add New Teacher</h1>
        <p className="form-subtitle">Register a new faculty member into the school management system.</p>
      </div>

      <form onSubmit={handleSubmit} className="teacher-form">
        {/* Personal Information Section */}
        <section className="form-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            <div className="section-divider"></div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Johnathan"
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Smith"
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
              placeholder="john.smith@school.edu"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="joiningDate">Joining Date</label>
              <input
                type="date"
                id="joiningDate"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className={errors.joiningDate ? 'error' : ''}
              />
              {errors.joiningDate && <span className="error-message">{errors.joiningDate}</span>}
            </div>
          </div>
        </section>

        {/* Professional Details Section */}
        <section className="form-section">
          <div className="section-header">
            <h2>Professional Details</h2>
            <div className="section-divider"></div>
          </div>

          <div className="form-group">
            <label htmlFor="employeeId">Employee ID</label>
            <div className="employee-id-container">
              <input
                type="text"
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                className="employee-id-input"
              />
              <button 
                type="button" 
                className="generate-id-btn"
                onClick={() => setFormData(prev => ({ ...prev, employeeId: generateEmployeeId() }))}
              >
                Generate New
              </button>
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
                      ×
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
              placeholder="Ph.D. in Applied Mathematics from University of Education"
              rows="3"
              className={errors.qualifications ? 'error' : ''}
            />
            {errors.qualifications && <span className="error-message">{errors.qualifications}</span>}
          </div>
        </section>

        {/* Account Setup Section */}
        <section className="form-section">
          <div className="section-header">
            <h2>Account Setup</h2>
            <div className="section-divider"></div>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="john.smith"
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
                  placeholder="Enter password"
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
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button 
                  type="button" 
                  className="toggle-password-btn"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? '👁' : '👁'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
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
  );
};

export default AddTeacherForm;