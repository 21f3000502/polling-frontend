import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import TeacherPollForm from './TeacherPollForm.jsx';
import TeacherPollResults from './TeacherPollResult.jsx';
import StudentPage from './StudentPage.jsx';
import PollHistory from './PollHistory.jsx';
import KickedPage from './KickedPage.jsx';
import EndPage from './EndPage.jsx';


// Placeholder components for other routes
// function TeacherPollForm() {
//   // return <div className="p-8">Teacher Poll Creation Page (to be implemented)</div>;
//   return TeacherPollForm
// }
// function StudentPage() {
//   return <div className="p-8">Student Page (to be implemented)</div>;
// }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teacher/create" element={<TeacherPollForm />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path='/teacher/results' element={<TeacherPollResults />}/>
        <Route path="/teacher/history" element={<PollHistory />} />
        <Route path="/kicked" element={<KickedPage />} />
        <Route path="/end" element={<EndPage />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
