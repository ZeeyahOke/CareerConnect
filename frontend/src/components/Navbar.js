import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { logout, isAuthenticated, isStudent, isMentor, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">CareerConnect</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Dashboard
                </Link>
                
                {isStudent && (
                  <>
                    <Link to="/mentors" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                      Find Mentors
                    </Link>
                    <Link to="/assessment" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                      Career Assessment
                    </Link>
                    <Link to="/progress" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                      My Progress
                    </Link>
                  </>
                )}
                
                {isMentor && (
                  <>
                    <Link to="/requests" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                      Requests
                    </Link>
                    <Link to="/resources" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                      Resources
                    </Link>
                  </>
                )}
                
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                    Admin Panel
                  </Link>
                )}
                
                <Link to="/messages" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Messages
                </Link>
                <Link to="/sessions" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Sessions
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Dashboard
                </Link>
                {isStudent && (
                  <>
                    <Link to="/mentors" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                      Find Mentors
                    </Link>
                    <Link to="/assessment" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                      Career Assessment
                    </Link>
                    <Link to="/progress" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                      My Progress
                    </Link>
                  </>
                )}
                {isMentor && (
                  <>
                    <Link to="/requests" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                      Requests
                    </Link>
                    <Link to="/resources" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                      Resources
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link to="/admin" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                    Admin Panel
                  </Link>
                )}
                <Link to="/messages" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Messages
                </Link>
                <Link to="/sessions" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Sessions
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 text-gray-700 hover:bg-gray-100">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
