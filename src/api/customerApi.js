import axiosClient from './axiosClient';

const customerApi = {
  getAll: () => axiosClient.get('/khach-hang'),
  getById: (id) => axiosClient.get(`/khach-hang/${id}`),
  searchByPhone: (phone) =>
    axiosClient.get('/khach-hang').then(res =>
      (Array.isArray(res) ? res : []).find(kh => kh.soDienThoai === phone) || null
    ),
  create: (data) => axiosClient.post('/khach-hang', data),
};

export default customerApi;
