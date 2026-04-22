import axiosClient from './axiosClient';

const staffApi = {
  getProfile: (id) => {
    return axiosClient.get(`/nhan-vien/${id}`);
  }
};

export default staffApi;
