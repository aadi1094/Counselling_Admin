import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3008'  // Update this to match your admin API port
});

// Add a request interceptor to add the token to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.token = token;
  }
  return config;
});

export default axiosInstance;
