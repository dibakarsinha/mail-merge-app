import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Student API endpoints
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  add: (data) => api.post('/students', data),
  update: (rowIndex, data) => api.put(`/students/${rowIndex}`, data),
  delete: (rowIndex) => api.delete(`/students/${rowIndex}`),
  getStats: () => api.get('/students/stats'),
  bulkAdd: (students) => api.post('/students/bulk', students),
  exportData: (format = 'csv') => api.get(`/students/export?format=${format}`, { responseType: 'blob' })
};

// Email API endpoints
export const emailAPI = {
  send: (student) => api.post('/email/send', { student }),
  sendBulk: (students, delay = 1500, settings = {}) => 
    api.post('/email/send-bulk', { students, delay, settings }),
  test: (testEmail) => api.post('/email/test', { testEmail }),
  schedule: (scheduleData) => api.post('/email/schedule', scheduleData),
  getScheduled: () => api.get('/email/scheduled'),
  cancelScheduled: (jobId) => api.delete(`/email/scheduled/${jobId}`),
  getHistory: (filters = {}) => api.get('/email/history', { params: filters }),
  getTemplate: () => api.get('/email/template'),
  updateTemplate: (template) => api.put('/email/template', template)
};

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Settings API endpoints
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (settings) => api.put('/settings', settings),
  getEmailSettings: () => api.get('/settings/email'),
  updateEmailSettings: (settings) => api.put('/settings/email', settings),
  testConnection: () => api.post('/settings/test-connection')
};

// Dashboard API endpoints
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getChartData: (period = 'week') => api.get(`/dashboard/chart-data?period=${period}`)
};

export default api;