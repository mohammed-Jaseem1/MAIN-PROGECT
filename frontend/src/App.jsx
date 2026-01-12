import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage.jsx';
import Loginpage from './components/Loginpage.jsx';
import Admindash from './components/Admindash.jsx';
import TeacherManagement from './components/TeacherManagement.jsx';
import AddTeacherForm from './components/AddTeacherForm.jsx';
import Teacherdashborad from './components/Teacherdashborad.jsx';
import Questionpapermanagent from './components/Questionpapermanagent.jsx';
import ManageExams from './components/ManageExams.jsx';
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
      </Routes>
    </Router>
  );
}

export default App
