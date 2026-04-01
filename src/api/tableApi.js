import axiosClient from './axiosClient';

const tableApi = {
  getTables: () => {
    return axiosClient.get('/ban');
  },
  getAll: () => {
    return axiosClient.get('/ban');
  },
  // Add other table methods: updateStatus, getById, etc.
};

export default tableApi;
