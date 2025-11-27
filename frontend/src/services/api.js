import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  passwordReset: (email) => api.post('/auth/password-reset', { email }),
};

// Student APIs
export const studentAPI = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  createAssessment: (data) => api.post('/students/assessment', data),
  getAssessments: () => api.get('/students/assessments'),
  getProgress: () => api.get('/students/progress'),
  createProgress: (data) => api.post('/students/progress', data),
  updateProgress: (trackerId, data) => api.put(`/students/progress/${trackerId}`, data),
};

// Mentor APIs
export const mentorAPI = {
  getProfile: () => api.get('/mentors/profile'),
  updateProfile: (data) => api.put('/mentors/profile', data),
  searchMentors: (params) => api.get('/mentors/search', { params }),
  getMentor: (mentorId) => api.get(`/mentors/${mentorId}`),
  requestMentorship: (data) => api.post('/mentors/request', data),
  getMentorshipRequests: () => api.get('/mentors/requests'),
  respondToRequest: (requestId, status) => api.put(`/mentors/requests/${requestId}`, { status }),
  getResources: () => api.get('/mentors/resources'),
  uploadResource: (data) => api.post('/mentors/resources', data),
};

// Communication APIs
export const communicationAPI = {
  getMessages: () => api.get('/communications/messages'),
  sendMessage: (data) => api.post('/communications/messages', data),
  markMessageRead: (messageId) => api.put(`/communications/messages/${messageId}/read`),
  getSessions: () => api.get('/communications/sessions'),
  createSession: (data) => api.post('/communications/sessions', data),
  updateSession: (sessionId, data) => api.put(`/communications/sessions/${sessionId}`, data),
};

// Admin APIs
export const adminAPI = {
  getUsers: (role) => api.get('/admin/users', { params: { role } }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  verifyMentor: (mentorId, status) => api.put(`/admin/mentors/verify/${mentorId}`, { status }),
  getPendingMentors: () => api.get('/admin/mentors/pending'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSessionReport: () => api.get('/admin/reports/sessions'),
  updateProfile: (data) => api.put('/admin/profile', data),
};

export default api;
