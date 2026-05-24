import axiosClient from './axiosClient';

const invoiceApi = {
  getInvoicesByType: (type) => {
    // type: 'TAI_BAN' | 'MANG_VE'
    return axiosClient.get(`/hoa-don/loc-theo-loai?loai=${type}`);
  },
  getAll: () => {
    return axiosClient.get('/hoa-don');
  },
  filterByDateRange: (tuNgay, denNgay) => {
    return axiosClient.get(`/hoa-don/loc-theo-khoang-ngay?tuNgay=${tuNgay}&denNgay=${denNgay}`);
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
  confirmPayment: (id, bodyWithMethod) => {
    // bodyWithMethod should include { idKhachHang, maCode, diemSuDung, danhSachIdThuePhi, phuongThuc }
    return axiosClient.post(`/hoa-don/${id}/xac-nhan-thanh-toan`, bodyWithMethod);
  },
  completeOrder: (id) => {
    return axiosClient.post(`/hoa-don/${id}/hoan-tat`);
  },
  cancelOrder: (id) => {
    return axiosClient.delete(`/hoa-don/${id}/huy`);
  },
};

export default invoiceApi;
