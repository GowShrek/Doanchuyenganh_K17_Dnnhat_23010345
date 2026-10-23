const BorrowService = require('../services/borrow.service');
const { OK, Created } = require('../core/success.response');

class BorrowController {
    // Độc giả gửi yêu cầu mượn
    async requestBorrow(req, res) {
        const data = await BorrowService.requestBorrow({
            userId: req.user.id,
            bookId: req.body.bookId,
            note: req.body.note,
            borrowDate: req.body.borrowDate,
            dueDate: req.body.dueDate,
        });
        new Created({ message: 'Gửi yêu cầu mượn thành công', metadata: data }).send(res);
    }

    // Admin / Thủ thư xem tất cả
    async getAll(req, res) {
        const data = await BorrowService.getAll(req.query);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // Độc giả xem lịch sử của mình
    async getMyBorrows(req, res) {
        const data = await BorrowService.getMyBorrows({
            userId: req.user.id,
            ...req.query,
        });
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // Chi tiết phiếu
    async getById(req, res) {
        const data = await BorrowService.getById(req.params.id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // Thủ thư duyệt
    async approve(req, res) {
        const data = await BorrowService.approve(req.params.id, req.user.id);
        new OK({ message: 'Đã duyệt phiếu mượn', metadata: data }).send(res);
    }

    // Thủ thư từ chối
    async reject(req, res) {
        const data = await BorrowService.reject(req.params.id, {
            note: req.body.note,
            approvedBy: req.user.id,
        });
        new OK({ message: 'Đã từ chối phiếu mượn', metadata: data }).send(res);
    }

    // Xác nhận trả sách
    async returnBook(req, res) {
        const data = await BorrowService.returnBook(req.params.id, {
            returnedBy: req.user.id,
            note: req.body.note,
            condition: req.body.condition, // 'normal' | 'damaged' | 'lost'
        });
        new OK({ message: 'Xác nhận trả sách thành công', metadata: data }).send(res);
    }

    // Stats
    async getStats(req, res) {
        const data = await BorrowService.getStats();
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // Độc giả gửi yêu cầu gia hạn
    async requestRenew(req, res) {
        const data = await BorrowService.requestRenew(req.params.id, req.user.id, {
            renewDueDate: req.body.renewDueDate,
            renewNote: req.body.renewNote,
        });
        new OK({ message: 'Gửi yêu cầu gia hạn thành công, chờ thủ thư duyệt', metadata: data }).send(res);
    }

    // Thủ thư duyệt gia hạn
    async approveRenew(req, res) {
        const data = await BorrowService.approveRenew(req.params.id, req.user.id);
        new OK({ message: 'Đã duyệt gia hạn', metadata: data }).send(res);
    }

    // Thủ thư từ chối gia hạn
    async rejectRenew(req, res) {
        const data = await BorrowService.rejectRenew(req.params.id, {
            approvedBy: req.user.id,
            renewNote: req.body.renewNote,
        });
        new OK({ message: 'Đã từ chối gia hạn', metadata: data }).send(res);
    }
}

module.exports = new BorrowController();
