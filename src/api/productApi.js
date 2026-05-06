import axiosClient from './axiosClient';

const productApi = {
  getAllProducts: () => {
    return axiosClient.get('/san-pham');
  },
};

export default productApi;
