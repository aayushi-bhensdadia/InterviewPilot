import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import InterviewRoom from "./pages/InterviewRoom";
import Results from "./pages/Results";
import Profile from "./pages/Profile";
import CreateInterview from "./pages/CreateInterview";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/createInterview" element={<ProtectedRoute><CreateInterview /></ProtectedRoute>} />
        <Route path="/interview/:id" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
        <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
