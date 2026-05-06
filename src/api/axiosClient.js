import axios from 'axios';
import safeAsyncStorage from '../utils/storage';

const axiosClient = axios.create({
  baseURL: 'http://10.0.2.2:8080/api', // Android Emulator default to localhost
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 50000, // Tăng timeout lên 50s vì gửi email có thể chậm
});

// Interceptor to add token to requests
axiosClient.interceptors.request.use(
  async (config) => {
    const token = await safeAsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global errors
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let message = 'Đã có lỗi xảy ra';

    if (error.response && error.response.data) {
      const data = error.response.data;
      message = data.message || data.detail || data.error || data.title || (typeof data === 'string' ? data : message);
    } else if (error.code === 'ECONNABORTED') {
      message = 'Hệ thống đang xử lý yêu cầu quá lâu (Timeout). Vui lòng kiểm tra email hoặc thử lại sau.';
    } else {
      message = error.message || message;
    }

    console.log('API Error Details::', {
      status: error.response?.status,
      message: message,
      data: error.response?.data
    });

    return Promise.reject({ ...error, message });
  }
);

export default axiosClient;
