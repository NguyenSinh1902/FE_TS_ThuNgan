import axiosClient from './axiosClient';

const promotionApi = {
  getActive: () => {
    return axiosClient.get('/khuyen-mai/dang-hoat-dong');
  },
  checkCode: (maCode, tongTien) => {
    return axiosClient.get(`/khuyen-mai/kiem-tra?maCode=${maCode}&tongTien=${tongTien}`);
  },
};

export default promotionApi;
