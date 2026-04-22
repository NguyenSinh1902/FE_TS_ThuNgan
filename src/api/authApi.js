import axiosClient from './axiosClient';

const authApi = {
  login: (data) => {
    return axiosClient.post('/auth/login', data);
  },
  register: (data) => {
    // Standard register for staff
    return axiosClient.post('/auth/register', {
      ...data,
      vaiTro: 'THU_NGAN' // Default role for this app
    });
  },
  verifyRegister: (data) => {
    return axiosClient.post('/auth/verify-register', data);
  }
};

export default authApi;
