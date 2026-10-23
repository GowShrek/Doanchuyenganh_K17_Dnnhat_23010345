const ReservationService = require('../services/reservation.service');
const { OK, Created } = require('../core/success.response');

class ReservationController {
    // Độc giả đặt trước
    create = async (req, res) => {
        const data = await ReservationService.create(req.params.bookId, req.user.id, req.body);
        return new Created({ message: 'Đặt trước thành công! Chúng tôi sẽ thông báo khi có sách.', metadata: data }).send(res);
    };

    // Xem đặt trước của mình
    getMyReservations = async (req, res) => {
        const data = await ReservationService.getMyReservations(req.user.id, req.query);
        return new OK({ message: 'OK', metadata: data }).send(res);
    };

    // Kiểm tra mình có đang đặt trước cuốn sách nào không
    getMyReservationForBook = async (req, res) => {
        const data = await ReservationService.getMyReservationForBook(req.params.bookId, req.user.id);
        return new OK({ message: 'OK', metadata: { reservation: data } }).send(res);
    };

    // Số người đang xếp hàng chờ
    getQueueInfo = async (req, res) => {
        const data = await ReservationService.getQueueInfo(req.params.bookId);
        return new OK({ message: 'OK', metadata: data }).send(res);
    };

    // Hủy đặt trước
    cancel = async (req, res) => {
        const data = await ReservationService.cancel(req.params.id, req.user.id);
        return new OK({ message: 'Đã hủy đặt trước', metadata: data }).send(res);
    };

    // Admin: xem tất cả
    getAll = async (req, res) => {
        const data = await ReservationService.getAll(req.query);
        return new OK({ message: 'OK', metadata: data }).send(res);
    };

    // Admin: hủy bất kỳ
    adminCancel = async (req, res) => {
        const data = await ReservationService.adminCancel(req.params.id);
        return new OK({ message: 'Đã hủy đặt trước', metadata: data }).send(res);
    };
}

module.exports = new ReservationController();
