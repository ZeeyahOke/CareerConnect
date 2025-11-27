import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.user);
      setProfile(response.data.profile);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Error fetching current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, user, profile } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setProfile(profile);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  const updateUserProfile = (newProfile) => {
    setProfile(newProfile);
    // keep localStorage user in sync if user object contains profile-related fields
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        // update user fields that may have changed (like name or phone_number)
        if (newProfile?.name) u.name = newProfile.name;
        if (newProfile?.phone_number) u.phone_number = newProfile.phone_number;
        localStorage.setItem('user', JSON.stringify(u));
        setUser(u);
      } catch (e) {
        // ignore parse errors
      }
    }
  };

  const updateUser = (newUser, newProfile) => {
    if (newUser) {
      setUser(newUser);
      try {
        localStorage.setItem('user', JSON.stringify(newUser));
      } catch (e) {}
    }
    if (newProfile) {
      setProfile(newProfile);
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    updateUser,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isMentor: user?.role === 'mentor',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
