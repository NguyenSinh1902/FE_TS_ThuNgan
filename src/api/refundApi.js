import axiosClient from './axiosClient';

const refundApi = {
  createRefundRequest: (body) => {
    // body: { idHoaDon, soTienHoan, lyDo }
    return axiosClient.post('/phieu-hoan-tra', body);
  },
  completeRefund: (idPhieu) => {
    return axiosClient.patch(`/phieu-hoan-tra/${idPhieu}/hoan-thanh`);
  },
  getAll: () => {
    return axiosClient.get('/phieu-hoan-tra');
  }
};

export default refundApi;
