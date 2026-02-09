import React, { useEffect, useState } from "react";
import "./style/TeacherNotification.css";
import {
  School,
  Dashboard,
  MenuBook,
  Notifications
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function TeacherNotification() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/notifications/teacher")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [marking]);

  const handleMarkAllRead = async () => {
    setMarking(true);
    await fetch("http://localhost:5000/api/notifications/teacher/mark-all-read", {
      method: "PATCH"
    });
    setMarking(false);
  };

  return (
    <div className="notifications-layout">
      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          width: 200,
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
          <div className="logo">
            <div className="logo-icon">
              <School />
            </div>
            <div>
              <h2>EduPlatform</h2>
              <p>Teacher Portal</p>
            </div>
          </div>

          <nav>
            <button
              className="sidebar-item"
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                textAlign: "left",
                padding: "12px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "8px",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                transition: "background 0.2s"
              }}
              onClick={() => navigate("/teacher-dashboard")}
            >
              <Dashboard style={{ fontSize: 22 }} />
              <span style={{ marginLeft: 10 }}>Dashboard</span>
            </button>
            <button
              className="sidebar-item"
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                textAlign: "left",
                padding: "12px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "8px",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                transition: "background 0.2s"
              }}
            >
              <MenuBook style={{ fontSize: 22 }} />
              <span style={{ marginLeft: 10 }}>My Classes</span>
            </button>
            <button
              className="sidebar-item active"
              style={{
                background: "#334155",
                color: "#fff",
                border: "none",
                textAlign: "left",
                padding: "12px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "8px",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                transition: "background 0.2s"
              }}
            >
              <Notifications style={{ fontSize: 22 }} />
              <span style={{ marginLeft: 10 }}>Notifications</span>
            </button>
          </nav>
        </div>
        <div
          className="profile"
          style={{
            borderTop: "1px solid #334155",
            paddingTop: "18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              marginBottom: 8
            }}
          >
            <School style={{ fontSize: 32, color: "#fff" }} />
          </span>
          <div style={{ fontWeight: "bold", fontSize: "1rem" }}>Teacher Name</div>
          <div style={{ fontSize: "0.85rem", color: "#cbd5e1", marginBottom: 8 }}>teacher@email.com</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="header">
          <div>
            <h1>Teacher Notifications</h1>
            <p>Stay updated with your teaching alerts.</p>
          </div>
          <button className="mark-read" onClick={handleMarkAllRead} disabled={marking}>
            ✓ Mark all as read
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className="tab active">All (0)</button>
          <button className="tab">Unread (0)</button>
          <button className="tab">Assignments</button>
          <button className="tab">Class Updates</button>
        </div>

        {/* Notification List */}
        <div className="notification-list">
          {loading ? (
            <div style={{ color: "#cbd5e1", padding: "24px", textAlign: "center" }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={{ color: "#cbd5e1", padding: "24px", textAlign: "center" }}>No notifications to display.</div>
          ) : (
            notifications.map((n) => (
              <div key={n._id} className={`notification-item${n.read ? " read" : ""}`} style={{background: n.read ? "#e2e8f0" : "#f1f5f9", marginBottom: 12, borderRadius: 8, padding: 16}}>
                <div style={{ fontWeight: "bold" }}>{n.title}</div>
                <div>{n.body}</div>
                <div style={{ fontSize: "0.8em", color: "#888" }}>{new Date(n.createdAt).toLocaleString()}</div>
                {!n.read && <span style={{color: '#0ea5e9', fontSize: 12}}>Unread</span>}
              </div>
            ))
          )}
        </div>

        <div className="footer">
          <button className="load-btn" disabled>
          </button>
        </div>
      </main>
    </div>
  );
}

export default TeacherNotification;
