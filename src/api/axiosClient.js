import axios from 'axios';

const axiosClient = axios.create({
  // baseURL: 'http://localhost:8080/api',
  baseURL: 'http://10.0.2.2:8080/api', // Use 10.0.2.2 for Android Emulator to reach localhost
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors for professional handling
axiosClient.interceptors.request.use(
  (config) => {
    // Add auth token here if needed: config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Handle global errors like 401, 500, etc.
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export default axiosClient;
