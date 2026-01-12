import "./style/Login.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isTeacher, setIsTeacher] = useState(false); // NEW

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const url = isTeacher
        ? "http://localhost:5000/api/teacher/login"
        : "http://localhost:5000/api/auth/login";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Login successful!");
        setTimeout(() => {
          navigate(isTeacher ? "/teacher-dashboard" : "/admin");
        }, 800);
      } else {
        setMsg(data.error || "Login failed");
      }
    } catch {
      setMsg("Login failed. Server error.");
    }
  };

  return (
    <div className="login-wrapper">
      {/* BACK BUTTON */}
      <button
        className="login-back-btn"
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: 24,
          left: 32,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
        aria-label="Back to Home"
      >
        <span
          style={{
            fontSize: 22,
            lineHeight: 1,
            color: "#2563eb",
            display: "inline-block",
          }}
        >
          ←
        </span>
        Back
      </button>

      {/* LEFT SECTION */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo"></div>
          <span>EdPlatform</span>
        </div>

        <h1 className="login-title">Log in to your account</h1>
        <p className="login-subtitle">
          Welcome back! Please enter your details.
        </p>

        <form className="login-form" onSubmit={handleLogin}>
          <label className="login-label">Email</label>
          <input
            type="email"
            className="login-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="login-label">Password</label>
          <div className="login-password-box">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="login-eye"
              onClick={() => setShowPassword((v) => !v)}
              style={{ userSelect: "none" }}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <div className="login-forgot">Forgot password?</div>

          <div style={{ marginBottom: 12 }}>
            <label>
              <input
                type="checkbox"
                checked={isTeacher}
                onChange={() => setIsTeacher((v) => !v)}
                style={{ marginRight: 8 }}
              />
              Login as Teacher
            </label>
          </div>

          <button className="login-button" type="submit">
            Sign In
          </button>
          {msg && (
            <div
              style={{
                marginTop: 16,
                color: msg === "Login successful!" ? "#2563eb" : "red",
              }}
            >
              {msg}
            </div>
          )}
        </form>
      </div>

      {/* RIGHT SECTION */}
      <div className="login-right">
        <div className="login-overlay">
          <div className="login-testimonial">
            <div className="login-rating">★★★★★</div>

            <p className="login-quote">
              “EdPlatform has completely transformed the way I study.
              The interactive courses and student dashboard make learning
              organized and efficient.”
            </p>

            <p className="login-author"></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
