import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Mentors from './pages/Mentors';
import Assessment from './pages/Assessment';
import Progress from './pages/Progress';
import Messages from './pages/Messages';
import Sessions from './pages/Sessions';
import Profile from './pages/Profile';
import Requests from './pages/Requests';
import Resources from './pages/Resources';
import Admin from './pages/Admin';

const PrivateRoute = ({ children, adminOnly = false, mentorOnly = false, studentOnly = false }) => {
  const { isAuthenticated, isAdmin, isMentor, isStudent, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  if (mentorOnly && !isMentor) {
    return <Navigate to="/dashboard" />;
  }

  if (studentOnly && !isStudent) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/sessions" element={<PrivateRoute><Sessions /></PrivateRoute>} />
          
          <Route path="/mentors" element={<PrivateRoute studentOnly><Mentors /></PrivateRoute>} />
          <Route path="/assessment" element={<PrivateRoute studentOnly><Assessment /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute studentOnly><Progress /></PrivateRoute>} />
          
          <Route path="/requests" element={<PrivateRoute mentorOnly><Requests /></PrivateRoute>} />
          <Route path="/resources" element={<PrivateRoute mentorOnly><Resources /></PrivateRoute>} />
          
          <Route path="/admin" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
