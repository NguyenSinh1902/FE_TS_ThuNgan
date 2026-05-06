import axiosClient from './axiosClient';

const statsApi = {
  getDashboardData: () => {
    return axiosClient.get('/thong-ke/dashboard');
  },
};

export default statsApi;
