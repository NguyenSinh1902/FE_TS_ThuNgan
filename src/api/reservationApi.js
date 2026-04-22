import axiosClient from './axiosClient';

const reservationApi = {
    getActiveReservations: () => {
        return axiosClient.get('/phieu-dat-ban/dang-hoat-dong');
    },
};

export default reservationApi;
