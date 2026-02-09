import React, { useState } from 'react';
import './style/Settings.css';
// Add useNavigate import
import { useNavigate } from 'react-router-dom';

const NotificationSettings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('email');
  const [subject, setSubject] = useState('New Exam Published: {{exam_name}}');
  const [body, setBody] = useState(`Hi {{user_name}},

A new examination "{{exam_name}}" has been published in your module "{{module_name}}".

Date: {{exam_date}}
Time: {{exam_time}}

Please log in to the portal to view the details and study materials.

Regards,
Academic Department`);

  const [triggers, setTriggers] = useState([
    {
      id: 1,
      name: 'Exam Published',
      description: 'Triggered when a teacher publishes a new examination.',
      inApp: true
    },
    {
      id: 2,
      name: 'Result Declared',
      description: 'Triggered when exam results are officially announced.',
      inApp: true
    },
    {
      id: 3,
      name: 'User Registration',
      description: 'Welcome message for new students or faculty members.',
      inApp: false
    },
    {
      id: 4,
      name: 'System Maintenance',
      description: 'Scheduled downtime or platform update notifications.',
      inApp: true
    }
  ]);

  const variables = [
    '{{user_name}}',
    '{{exam_name}}',
    '{{exam_date}}',
    '{{exam_time}}',
    '{{module_name}}',
    '{{portal_url}}'
  ];

  const handleToggle = (id, channel) => {
    setTriggers(triggers.map(trigger => {
      if (trigger.id === id) {
        return { ...trigger, [channel]: !trigger[channel] };
      }
      return trigger;
    }));
  };

  const insertVariable = (variable) => {
    const textarea = document.querySelector('.message-textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newBody = body.substring(0, start) + variable + body.substring(end);
      setBody(newBody);
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
    }
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const navigate = useNavigate();

  const [message, setMessage] = useState('');

  const handleSendNotification = async () => {
    try {
      await Promise.all([
        fetch('http://localhost:5000/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: 'student',
            title: subject,
            body
          })
        }),
        fetch('http://localhost:5000/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: 'teacher',
            title: subject,
            body
          })
        })
      ]);
      setMessage('✅ Test notification sent!');
    } catch (err) {
      setMessage('❌ Failed to send notification');
    }
    setTimeout(() => setMessage(''), 2000);
  };

  const handleSaveChanges = () => {
    setMessage('✅ Changes saved successfully!');
    setTimeout(() => setMessage(''), 2000);
  };

  // Add discard handler
  const handleDiscardChanges = () => {
    setMessage('❌ Changes discarded.');
    setTimeout(() => {
      setMessage('');
      window.location.reload();
    }, 1200);
  };

  return (
    <div className={`notification-settings-container${darkMode ? ' dark' : ''}`}>
      {/* Sidebar with teacher profile at bottom */}
      <div
        style={{
          width: 180,
          background: "#1e293b",
          color: "#fff",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1100,
          display: "flex",
          flexDirection: "column",
          padding: "32px 16px",
          gap: "16px",
          justifyContent: "space-between"
        }}
      >
        <div>
          <div style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "18px" }}>Menu</div>
          <button
            style={{ background: "#1e293b", color: "#fff", border: "none", textAlign: "left", padding: "10px", borderRadius: "6px", cursor: "pointer" }}
            onClick={() => window.location.href = "/admin"}
          >
            Dashboard
          </button>
          <button
            style={{ background: "#1e293b", color: "#fff", border: "none", textAlign: "left", padding: "10px", borderRadius: "6px", cursor: "pointer" }}
            onClick={() => window.location.href = "/settings"}
          >
            Notifications
          </button>
        </div>
        {/* Teacher/Admin Profile at bottom */}
        <div style={{
          borderTop: "1px solid #334155",
          paddingTop: "18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            marginBottom: 8
          }}>
            {/* Placeholder avatar, replace with image if available */}
            <span role="img" aria-label="admin">👨‍💼</span>
          </div>
          <div style={{ fontWeight: "bold", fontSize: "1rem" }}>Admin</div>
          <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="container"
        style={{
          marginLeft: 220,
          maxWidth: "1700px",
          width: "calc(100% - 220px)",
          padding: "32px 24px",
          display: "flex",
          gap: "32px",
          justifyContent: "center",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Page Heading */}
          <div className="page-heading">
            <div className="heading-text">
              <h1 className="heading-title">System Notification Settings</h1>
              <p className="heading-subtitle">
                Configure automated alerts and custom message templates for all users.
              </p>
            </div>
            <div className="heading-actions">
              <button className="btn-secondary" onClick={handleSendNotification}>
                <span className="material-symbols-outlined">send</span>
                Send Test Notification
              </button>
              <button className="btn-primary" onClick={handleSaveChanges}>
                Save All Changes
              </button>
            </div>
          </div>
          {/* Show message if present */}
          {message && (
            <div style={{
              margin: '0 auto 1rem',
              maxWidth: 600,
              background: '#e0f7fa',
              color: '#00796b',
              borderRadius: 8,
              padding: '12px 20px',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
          {/* Notification Settings Card */}
          <div className="notification-settings-card">
            {/* Removed Channel Tabs */}
            {/* Triggers Section */}
            <div className="triggers-section">
              <h2 className="triggers-title">Notification Triggers & Channels</h2>
              <div className="triggers-list">
                {triggers.map(trigger => (
                  <div key={trigger.id} className="trigger-item">
                    <div className="trigger-info">
                      <p className="trigger-name">{trigger.name}</p>
                      <p className="trigger-description">{trigger.description}</p>
                    </div>
                    <div className="trigger-controls">
                      <div className="channel-toggles">
                        <div className="toggle-group">
                          <input 
                            type="checkbox" 
                            id={`inApp-${trigger.id}`}
                            checked={trigger.inApp}
                            onChange={() => handleToggle(trigger.id, 'inApp')}
                            className="channel-checkbox"
                          />
                          <label htmlFor={`inApp-${trigger.id}`} className="toggle-label">In-App</label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Template Editor Card */}
          <div className="template-editor-card">
            <div className="editor-header">
              <div>
                <h3 className="editor-title">Template Editor: Exam Published</h3>
                <p className="editor-subtitle">
                  Customize the message content for the 'Exam Published' event.
                </p>
              </div>
              <div className="status-badge">
                <span>Draft</span>
              </div>
            </div>

            <div className="editor-content">
              {/* Input Fields */}
              <div className="input-section">
                <div className="form-group">
                  <label className="form-label">Email Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="subject-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message Body</label>
                  <div className="text-editor">
                    <div className="editor-toolbar">
                      <span className="material-symbols-outlined toolbar-icon">format_bold</span>
                      <span className="material-symbols-outlined toolbar-icon">format_italic</span>
                      <span className="material-symbols-outlined toolbar-icon">link</span>
                      <span className="material-symbols-outlined toolbar-icon code-icon">
                        code
                      </span>
                    </div>
                    <textarea
                      className="message-textarea"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows="6"
                    />
                  </div>
                </div>
              </div>

              {/* Variables & Preview Sidebar */}
              <div className="sidebar-section">
                <div className="variables-section">
                  <h4 className="variables-title">Available Tags</h4>
                  <div className="variables-grid">
                    {variables.map((variable, index) => (
                      <button
                        key={index}
                        className="variable-tag"
                        onClick={() => insertVariable(variable)}
                      >
                        {variable}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="tips-section">
                  <h4 className="tips-title">Helpful Tips</h4>
                  <p className="tips-text">
                    Click a tag to insert it at your cursor position. Tags are automatically replaced with real data when the notification is sent.
                  </p>
                </div>
                <button className="restore-btn">
                  Restore Default Template
                </button>
              </div>
            </div>
          </div>

          {/* Footer / Test Area */}
          <div className="footer-test-area">
            <div className="footer-info">
              <span className="material-symbols-outlined info-icon">info</span>
              <p className="footer-text">
                Unsaved changes detected. Remember to save before navigating away.
              </p>
            </div>
            <div className="footer-actions">
              <button className="text-btn" onClick={handleDiscardChanges}>Discard Changes</button>
              <button className="btn-primary" onClick={handleSaveChanges}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;