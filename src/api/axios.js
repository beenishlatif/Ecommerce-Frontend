import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // send the httpOnly auth cookie
  timeout: 15000,
});

// Normalize errors so every caller gets a readable message, never a raw crash
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
      (!error.response ? 'Network error. Check your connection and try again.' : null) ||
      'Something went wrong. Please try again.';
    return Promise.reject({ ...error, message });
  }
);

export default api;
