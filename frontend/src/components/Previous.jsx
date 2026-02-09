import React, { useState } from 'react';
import './style/PreviousPapers.css';

const ManagePapers = () => {
    // Delete paper handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this paper?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/papers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPapers(papers => papers.filter(p => p._id !== id));
      } else {
        const data = await res.json();
        alert('❌ Delete failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Delete failed: ' + err.message);
    }
  };
  const [papers, setPapers] = useState([]);
  // Remove duplicate useState declarations below if present
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('Degree Level');
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 15}, (_, i) => (currentYear - i).toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  React.useEffect(() => {
    // Fetch papers from backend
    fetch('http://localhost:5000/api/papers')
      .then(res => res.json())
      .then(data => setPapers(data))
      .catch(() => setPapers([]));
  }, [showUploadModal]); // refetch after upload

  // View modal state
  const [viewPaper, setViewPaper] = useState(null);
  const [viewFileUrl, setViewFileUrl] = useState(null);

  // Fetch file for viewing
  const handleView = async (paper) => {
    setViewPaper(paper);
    setViewFileUrl(null);
    try {
      const res = await fetch(`http://localhost:5000/api/papers/${paper._id}/file`);
      if (!res.ok) throw new Error('Failed to fetch file');
      const blob = await res.blob();
      setViewFileUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert('❌ Could not load file: ' + err.message);
    }
  };
  const stats = [];

  const navLinks = [
    { label: "Dashboard", active: false },
    { label: "Manage Papers", active: true },
    { label: "Students", active: false },
    { label: "Analytics", active: false }
  ];

  const sideNavLinks = [
    { icon: "description", label: "Past Papers", active: true },
    { icon: "database", label: "Question Bank", active: false },
    { icon: "analytics", label: "Student Reports", active: false }
  ];

  const levels = ["All Levels", "10th Level", "12th Level", "Degree Level"];
  const [activeLevel, setActiveLevel] = useState("All Levels");

  const getColorClass = (color, type = "bg") => {
    const colorMap = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", dark: "dark:bg-blue-900/30 dark:text-blue-400" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600", dark: "dark:bg-indigo-900/30 dark:text-indigo-400" },
      emerald: { bg: "bg-emerald-100", text: "text-emerald-600", dark: "dark:bg-emerald-900/30 dark:text-emerald-400" },
      amber: { bg: "bg-amber-100", text: "text-amber-600", dark: "dark:bg-amber-900/30 dark:text-amber-400" },
      primary: { bg: "bg-primary/10", text: "text-primary", dark: "" }
    };
    return `${colorMap[color]?.[type] || ''} ${colorMap[color]?.dark || ''}`;
  };

  const getStatColorClass = (color) => {
    const statColorMap = {
      primary: "bg-primary/10 text-primary",
      emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
    };
    return statColorMap[color] || statColorMap.primary;
  };

  const handleFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (uploadedFile) {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('title', uploadedFile.name);
      formData.append('year', selectedYear);
      formData.append('level', selectedLevel);

      try {
        const response = await fetch('http://localhost:5000/api/upload-paper', {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          alert('✅ Uploaded: ' + uploadedFile.name);
          setShowUploadModal(false);
          setUploadedFile(null);
        } else {
          const data = await response.json();
          alert('❌ Upload failed: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('❌ Upload failed: ' + err.message);
      }
    }
  };

  return (
    <div className="edu-platform">
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
            onClick={() => window.location.href = "/teacher-dashboard"}
          >
            Dashboard
          </button>
          <button
            style={{ background: "#1e293b", color: "#fff", border: "none", textAlign: "left", padding: "10px", borderRadius: "6px", cursor: "pointer" }}
            onClick={() => window.location.href = "/previous-papers"}
          >
            Previous Year Question Papers
          </button>
          <button
            style={{ background: "#1e293b", color: "#fff", border: "none", textAlign: "left", padding: "10px", borderRadius: "6px", cursor: "pointer" }}
            onClick={() => window.location.href = "/students"}
          >
            Students
          </button>
        </div>
        {/* Teacher Profile at bottom */}
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
            <span role="img" aria-label="teacher">👩‍🏫</span>
          </div>
          <div style={{ fontWeight: "bold", fontSize: "1rem" }}>Teacher Name</div>
          <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>teacher@email.com</div>
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
          <div className="page-header">
            <div className="page-title">
              <h1>Manage Previous Year Papers</h1>
              <p>Upload, update, and monitor the performance of KPSC exam papers.</p>
            </div>
            <button
              className="upload-button"
              onClick={() => setShowUploadModal(true)}
            >
              <span className="material-symbols-outlined">upload</span>
              <span>Upload New Paper</span>
            </button>
          </div>

          {/* Upload Modal */}
          {showUploadModal && (
            <div
              style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: "2rem",
                  borderRadius: "12px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                  minWidth: "320px",
                  maxWidth: "90vw"
                }}
              >
                <h3 style={{ marginBottom: "1rem" }}>Upload Previous Year Question Paper</h3>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  style={{ marginBottom: "1rem" }}
                />
                <div style={{ marginBottom: "1rem", display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label htmlFor="level-select" style={{ marginRight: "0.5rem" }}>Select Level:</label>
                  <select
                    id="level-select"
                    value={selectedLevel}
                    onChange={e => setSelectedLevel(e.target.value)}
                    style={{ padding: "0.4rem", borderRadius: "4px" }}
                  >
                    {levels.map((level, idx) => (
                      <option key={idx} value={level}>{level}</option>
                    ))}
                  </select>
                  <label htmlFor="year-select" style={{ marginLeft: "1rem", marginRight: "0.5rem" }}>Select Year:</label>
                  <select
                    id="year-select"
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    style={{ padding: "0.4rem", borderRadius: "4px" }}
                  >
                    {yearOptions.map((year, idx) => (
                      <option key={idx} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={handleUpload}
                    disabled={!uploadedFile}
                    style={{
                      background: "#1959b3",
                      color: "#fff",
                      border: "none",
                      padding: "0.5rem 1.5rem",
                      borderRadius: "6px",
                      fontWeight: 600,
                      cursor: uploadedFile ? "pointer" : "not-allowed"
                    }}
                  >
                    Upload
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadedFile(null);
                    }}
                    style={{
                      background: "#eee",
                      color: "#333",
                      border: "none",
                      padding: "0.5rem 1.5rem",
                      borderRadius: "6px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {uploadedFile && (
                  <div style={{ marginTop: "1rem", fontSize: "0.95rem", color: "#1959b3" }}>
                    Selected: {uploadedFile.name}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Filter Section */}
          <div className="filter-section">
            <p className="filter-label">Filter By Level:</p>
            <div className="filter-chips">
              {levels.map((level, index) => (
                <button
                  key={index}
                  className={`filter-chip ${activeLevel === level ? 'active' : ''}`}
                  onClick={() => setActiveLevel(level)}
                >
                  <span>{level}</span>
                </button>
              ))}
            </div>
            <div className="filter-actions">
              <button className="advanced-filter">
                <span className="material-symbols-outlined">filter_list</span>
                <span>Advanced Filters</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <div className="table-wrapper">
              <table className="papers-table">
                <thead>
                  <tr>
                    <th>Exam Title</th>
                    <th>Year</th>
                    <th>Level</th>
                    <th>Uploaded</th>
                    <th>Attempts</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    (papers.filter(paper =>
                      activeLevel === "All Levels" || paper.level === activeLevel
                    ).length === 0) ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '32px' }}>
                          No previous year papers available.
                        </td>
                      </tr>
                    ) : (
                      papers
                        .filter(paper => activeLevel === "All Levels" || paper.level === activeLevel)
                        .map((paper, idx) => (
                          <tr key={paper._id || idx}>
                            <td>{paper.title}</td>
                            <td>{paper.year}</td>
                            <td>{paper.level}</td>
                            <td>{new Date(paper.uploadedAt).toLocaleString()}</td>
                            <td>0</td>
                            <td className="text-right">
                              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                <button 
                                  style={{ background: 'none', border: 'none', cursor: 'pointer' }} 
                                  title="View"
                                  onClick={() => handleView(paper)}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1959b3' }}>visibility</span>
                                </button>
                                <button 
                                  style={{ background: 'none', border: 'none', cursor: 'pointer' }} 
                                  title="Delete"
                                  onClick={() => handleDelete(paper._id)}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: 'red' }}>delete</span>
                                </button>
                              </div>
                            </td>
                            {/* View Paper Modal */}
                            {viewPaper && (
                              <div
                                style={{
                                  position: "fixed",
                                  top: 0, left: 0, right: 0, bottom: 0,
                                  background: "rgba(0,0,0,0.3)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 9999
                                }}
                              >
                                <div
                                  style={{
                                    background: "#fff",
                                    padding: "2rem",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                                    minWidth: "320px",
                                    maxWidth: "90vw",
                                    maxHeight: "90vh",
                                    overflow: "auto"
                                  }}
                                >
                                  <h3 style={{ marginBottom: "1rem" }}>{viewPaper.title}</h3>
                                  <p><b>Year:</b> {viewPaper.year} &nbsp; <b>Level:</b> {viewPaper.level}</p>
                                  {viewFileUrl ? (
                                    viewPaper.mimetype && viewPaper.mimetype.startsWith('application/pdf') ? (
                                      <iframe src={viewFileUrl} title="PDF Preview" style={{ width: '100%', height: '60vh', border: '1px solid #ccc', marginTop: 16 }} />
                                    ) : (
                                      <a href={viewFileUrl} download={viewPaper.filename} style={{ color: '#1959b3', fontWeight: 600, marginTop: 16, display: 'inline-block' }}>Download File</a>
                                    )
                                  ) : (
                                    <p>Loading file...</p>
                                  )}
                                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                                    <button
                                      onClick={() => {
                                        setViewPaper(null);
                                        if (viewFileUrl) URL.revokeObjectURL(viewFileUrl);
                                        setViewFileUrl(null);
                                      }}
                                      style={{
                                        background: "#eee",
                                        color: "#333",
                                        border: "none",
                                        padding: "0.5rem 1.5rem",
                                        borderRadius: "6px",
                                        fontWeight: 600,
                                        cursor: "pointer"
                                      }}
                                    >
                                      Close
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </tr>
                        ))
                    )
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination (removed info line as requested) */}
            <div className="pagination">
              <div className="pagination-controls">
                <button className="pagination-button disabled" disabled>Previous</button>
                <button className="pagination-button active">1</button>
                <button className="pagination-button">2</button>
                <button className="pagination-button">3</button>
                <button className="pagination-button">Next</button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.length === 0 && (
              <div className="stat-card" style={{ textAlign: 'center', width: '100%' }}>
                No stats available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePapers;