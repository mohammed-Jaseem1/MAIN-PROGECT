import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage.jsx';
import Loginpage from './components/Loginpage.jsx';
import Admindash from './components/Admindash.jsx';
import TeacherManagement from './components/TeacherManagement.jsx';
import AddTeacherForm from './components/AddTeacherForm.jsx';
import Teacherdashborad from './components/Teacherdashborad.jsx';
import Questionpapermanagent from './components/Questionpapermanagent.jsx';
import ManageExams from './components/ManageExams.jsx';
import Studentmanagement from './components/Studentmanagement.jsx';
import AddStudent from './components/Addstudent.jsx';
import StudentDashboard from './components/Studentdashboard.jsx';
import Settings from './components/Settings.jsx';
import Previous from './components/Previous.jsx';
import StudentNotifications from './components/StudentNotifications.jsx';
import TeacherNotification from './components/TeacherNotification.jsx';
import './App.css';

import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/admin" element={<Admindash />} />
        <Route path="/teacher-management" element={<TeacherManagement />} />
        <Route path="/add-teacher" element={<AddTeacherForm />} />
        <Route path="/teacher-dashboard" element={<Teacherdashborad />} />
        <Route path="/question-paper-management" element={<Questionpapermanagent />} />
        <Route path="/manage-exams" element={<ManageExams />} />
        <Route path="/student-management" element={<Studentmanagement />} />
        <Route path="/add-student" element={<AddStudent />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/previous-papers" element={<Previous />} />
        <Route path="/student-notifications" element={<StudentNotifications />} />
        <Route path="/teacher-notifications" element={<TeacherNotification />} />
      </Routes>
    </Router>
  );
}

export default App
