import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for handling global auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  getMe: () => api.get('/api/auth/me'),
};

export const studentAPI = {
  getStudents: (params) => api.get('/api/students', { params }),
  getStudentById: (id) => api.get(`/api/students/${id}`),
  addStudent: (data) => api.post('/api/students', data),
  updateStudent: (id, data) => api.put(`/api/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/api/students/${id}`),
  uploadFile: (formData) => api.post('/api/students/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  saveBulk: (students) => api.post('/api/students/bulk-save', { students }),
  bulkSave: (students) => api.post('/api/students/bulk-save', { students }),
  getDownloadTemplateUrl: () => `${API_BASE_URL}/api/students/download-template`,
};

export const templateAPI = {
  getTemplates: () => api.get('/api/templates'),
  getTemplateById: (id) => api.get(`/api/templates/${id}`),
  uploadTemplate: (formData) => api.post('/api/templates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  saveFields: (id, fields) => api.put(`/api/templates/${id}/fields`, { fields }),
  deleteTemplate: (id) => api.delete(`/api/templates/${id}`),
  getImageUrl: (filename) => `${API_BASE_URL}/uploads/templates/${filename}`,
};

export const certificateAPI = {
  generateSingle: (student_id_or_payload, template_id, extraPayload = {}) => {
    let payload = {};
    if (typeof student_id_or_payload === 'object' && student_id_or_payload !== null) {
      payload = {
        student_id: student_id_or_payload.id || student_id_or_payload._id || student_id_or_payload.register_number,
        student_data: student_id_or_payload,
        template_id: template_id,
        ...extraPayload
      };
    } else {
      payload = {
        student_id: student_id_or_payload,
        template_id: template_id,
        ...extraPayload
      };
    }
    return api.post('/api/certificates/generate', payload);
  },
  generateBulk: (template_id, student_ids) =>
    api.post('/api/certificates/generate-bulk', { template_id, student_ids }),
  getCertificates: (params) => api.get('/api/certificates', { params }),
  deleteCertificate: (id) => api.delete(`/api/certificates/${id}`),
  getDownloadUrl: (filename) => `${API_BASE_URL}/api/certificates/download/${filename}`,
  getZipDownloadUrl: () => `${API_BASE_URL}/api/certificates/download-zip`,
};

export const verifyAPI = {
  verifyCertificate: (certificate_id) => api.get(`/api/verify/${certificate_id}`),
};

export default api;
