import axiosClient from './axiosClient';

const statsApi = {
  getTongQuanHomNay: () => {
    return axiosClient.get('/thong-ke/tong-quan-hom-nay');
  },
  getBieuDoDoanhThu: (tuNgay, denNgay) => {
    return axiosClient.get(`/thong-ke/bieu-do-doanh-thu?tuNgay=${tuNgay}&denNgay=${denNgay}&donVi=ngay`);
  },
  getTopSanPham: (tuNgay, denNgay) => {
    return axiosClient.get(`/thong-ke/top-san-pham?tuNgay=${tuNgay}&denNgay=${denNgay}`);
  },
};

export default statsApi;
