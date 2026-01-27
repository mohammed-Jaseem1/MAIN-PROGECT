import { useNavigate } from "react-router-dom";
import "./style/Home.css";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">🎓 EduFlow</div>

        <ul className="nav-links">
          {/* Removed Solutions, Resources, About Us, Contact */}
        </ul>

        <button className="cta-btn" onClick={() => navigate('/login')}>Start Learning</button>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-left">
          <span className="badge">AI-POWERED LEARNING</span>

          <h1>
            Education Makes <br />
            <span>Mastery Easier.</span>
          </h1>

          <p>
            Real-time insights into your learning progress allows you to be
            proactive. Ensure you meet your academic goals, track skill
            acquisition, and stay compliant—all while saving time.
          </p>

          <div className="trusted">
            <p>TRUSTED BY TOP INSTITUTIONS</p>
            <div className="trusted-logos">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE CARDS */}
        <div className="hero-right">
          <div className="activity-card">
            <h3>Study Activity</h3>
            <p className="sub">Weekly focus hours per subject</p>

            <div className="tabs">
              <span className="active">Weekly</span>
              <span>Monthly</span>
            </div>

            <div className="bars">
              <div className="bar"></div>
              <div className="bar highlight"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>

            <div className="days">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
            </div>
          </div>

          <div className="stats-card">
            <p><strong>Science</strong></p>
            <h2>92%</h2>
            <span>Completion</span>

            <hr />

            <p><strong>Math</strong></p>
            <h2>78%</h2>
            <span>Completion</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
