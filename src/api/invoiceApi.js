import axiosClient from './axiosClient';

const invoiceApi = {
  getInvoicesByType: (type) => {
    // type: 'TAI_BAN' | 'MANG_VE'
    return axiosClient.get(`/hoa-don/loc-theo-loai?loai=${type}`);
  },
  getInvoiceDetails: (id) => {
    return axiosClient.get(`/hoa-don/${id}`);
  },
  updateStatus: (id, trangThai) => {
    return axiosClient.patch(`/hoa-don/${id}/trang-thai?trangThai=${trangThai}`);
  },
  getFees: () => {
    return axiosClient.get('/thue-phi');
  },
  // Payment flow
  previewPayment: (id, body) => {
    return axiosClient.post(`/hoa-don/${id}/xuat-tam-tinh`, body);
  },
  confirmPayment: (id, phuongThuc, body) => {
    return axiosClient.post(`/hoa-don/${id}/xac-nhan-thanh-toan?phuongThuc=${phuongThuc}`, body);
  },
  completeOrder: (id) => {
    return axiosClient.post(`/hoa-don/${id}/hoan-tat`);
  },
};

export default invoiceApi;
