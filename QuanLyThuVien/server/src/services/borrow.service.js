const { Op } = require('sequelize');
const { sequelize } = require('../config/connectDB');
const { Borrow, Book, User } = require('../models/index');
const { BadRequestError, NotFoundError } = require('../core/error.response');

// Sinh mã phiếu mượn: BM-YYYYMMDD-XXXXX
const generateBorrowCode = () => {
    const d = new Date();
    const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `BM-${date}-${rand}`;
};

// Ngày hôm nay (DATEONLY)
const today = () => new Date().toISOString().split('T')[0];

// Thời hạn mượn tối đa của một phiếu (BR-11); gia hạn thêm theo BR-04
const MAX_BORROW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// Số lượng của đầu sách thay đổi theo tình trạng khi trả: hỏng vẫn về kho; mất thì không (BR-03)
const RETURN_COUNTERS = {
    normal: { availableQuantity: 1 },
    damaged: { availableQuantity: 1, damagedQuantity: 1 },
    lost: { lostQuantity: 1 },
};

// Hạn trả mặc định: +14 ngày
const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
};

// Include chuẩn khi trả về
const BORROW_INCLUDES = [
    {
        model: User, as: 'reader',
        attributes: ['id', 'fullName', 'email', 'studentId', 'phone', 'avatar'],
    },
    {
        model: Book, as: 'book',
        attributes: ['id', 'title', 'isbn', 'coverImage', 'availableQuantity'],
    },
];

class BorrowService {
    // ── Độc giả gửi yêu cầu mượn ──────────────────────────────────
    static async requestBorrow({ userId, bookId, note, borrowDate, dueDate }) {
        const book = await Book.findByPk(bookId);
        if (!book) throw new NotFoundError('Không tìm thấy sách');
        if (book.availableQuantity < 1) throw new BadRequestError('Sách hiện không còn trong kho');

        // Validate ngày
        if (!borrowDate) throw new BadRequestError('Vui lòng chọn ngày mượn');
        if (!dueDate) throw new BadRequestError('Vui lòng chọn ngày trả');
        if (new Date(dueDate) <= new Date(borrowDate)) throw new BadRequestError('Ngày trả phải sau ngày mượn');
        if ((new Date(dueDate) - new Date(borrowDate)) / DAY_MS > MAX_BORROW_DAYS) {
            throw new BadRequestError(`Thời hạn mượn tối đa ${MAX_BORROW_DAYS} ngày`);
        }

        // Kiểm tra độc giả chưa có phiếu mượn cùng cuốn đang xử lý
        const existing = await Borrow.findOne({
            where: { userId, bookId, status: { [Op.in]: ['pending', 'approved'] } },
        });
        if (existing) throw new BadRequestError('Bạn đang có phiếu mượn cuốn sách này chưa xử lý xong');

        const borrow = await Borrow.create({
            borrowCode: generateBorrowCode(),
            userId,
            bookId,
            status: 'pending',
            borrowDate: borrowDate || null,
            dueDate: dueDate || null,
            note: note || null,
        });

        const updated = await Borrow.findByPk(borrow.id, { include: BORROW_INCLUDES });

        try {
            const NotificationService = require('./notification.service');
            await NotificationService.notifyAdminNewBorrow(updated);
        } catch (e) { console.error('[NOTIF] notifyAdminNewBorrow error:', e.message); }

        return updated;
    }

    // ── Lấy danh sách phiếu mượn (admin/thủ thư) ──────────────────
    static async getAll({ status, userId, bookId, search, page = 1, limit = 10 } = {}) {
        const where = {};
        if (status) where.status = status;
        if (userId) where.userId = userId;
        if (bookId) where.bookId = bookId;

        const { count, rows } = await Borrow.findAndCountAll({
            where,
            include: [
                {
                    model: User, as: 'reader',
                    attributes: ['id', 'fullName', 'email', 'studentId', 'phone', 'avatar'],
                    ...(search ? { where: { [Op.or]: [{ fullName: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }, { studentId: { [Op.like]: `%${search}%` } }] } } : {}),
                    required: !!search,
                },
                { model: Book, as: 'book', attributes: ['id', 'title', 'isbn', 'coverImage'] },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            distinct: true,
        });

        return { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit), borrows: rows };
    }

    // ── Lịch sử mượn của độc giả ───────────────────────────────────
    static async getMyBorrows({ userId, status, page = 1, limit = 10 }) {
        const where = { userId };
        if (status) where.status = status;

        const { count, rows } = await Borrow.findAndCountAll({
            where,
            include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'isbn', 'coverImage'] }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        return { total: count, page: parseInt(page), borrows: rows };
    }

    // ── Chi tiết phiếu mượn ────────────────────────────────────────
    static async getById(id) {
        const borrow = await Borrow.findByPk(id, { include: BORROW_INCLUDES });
        if (!borrow) throw new NotFoundError('Không tìm thấy phiếu mượn');
        return borrow;
    }

    // ── Thủ thư duyệt phiếu mượn ──────────────────────────────────
    static async approve(id, approvedBy) {
        const borrow = await Borrow.findByPk(id);
        if (!borrow) throw new NotFoundError('Không tìm thấy phiếu mượn');
        if (borrow.status !== 'pending') throw new BadRequestError('Phiếu mượn không ở trạng thái chờ duyệt');

        // Duyệt và trừ kho trong cùng một transaction; mỗi lệnh chỉ ghi khi điều kiện còn đúng,
        // để hai thủ thư duyệt cùng lúc không cho mượn vượt số bản trong kho
        await sequelize.transaction(async (transaction) => {
            const [claimed] = await Borrow.update({
                status: 'approved',
                // Giữ ngày độc giả đã chọn; nếu chưa có mới dùng mặc định
                borrowDate: borrow.borrowDate || today(),
                dueDate: borrow.dueDate || defaultDueDate(),
                approvedBy,
            }, { where: { id, status: 'pending' }, transaction });
            if (!claimed) throw new BadRequestError('Phiếu mượn không ở trạng thái chờ duyệt');

            const [taken] = await Book.update(
                { availableQuantity: sequelize.literal('availableQuantity - 1') },
                { where: { id: borrow.bookId, availableQuantity: { [Op.gt]: 0 } }, transaction }
            );
            if (!taken) throw new BadRequestError('Sách hiện không còn trong kho');
        });

        // Độc giả đang được giữ chỗ (đặt trước) nay đã mượn được: đóng lượt đặt trước
        const ReservationService = require('./reservation.service');
        await ReservationService.markFulfilled(borrow.bookId, borrow.userId);

        const updated = await Borrow.findByPk(id, { include: BORROW_INCLUDES });

        // Thông báo cho độc giả
        try {
            const NotificationService = require('./notification.service');
            await NotificationService.notifyBorrowApproved(updated);
        } catch (e) { console.error('[NOTIF] approve error:', e.message); }

        return updated;
    }

    // ── Thủ thư từ chối phiếu mượn ────────────────────────────────
    static async reject(id, { note, approvedBy }) {
        const borrow = await Borrow.findByPk(id);
        if (!borrow) throw new NotFoundError('Không tìm thấy phiếu mượn');
        if (borrow.status !== 'pending') throw new BadRequestError('Phiếu mượn không ở trạng thái chờ duyệt');

        await borrow.update({ status: 'rejected', note: note || borrow.note, approvedBy });
        const updated = await Borrow.findByPk(id, { include: BORROW_INCLUDES });

        try {
            const NotificationService = require('./notification.service');
            await NotificationService.notifyBorrowRejected(updated);
        } catch (e) { console.error('[NOTIF] reject error:', e.message); }

        return updated;
    }

    // ── Xác nhận trả sách ──────────────────────────────────────────
    static async returnBook(id, { returnedBy, note, condition = 'normal' }) {
        const borrow = await Borrow.findByPk(id, {
            include: [{ model: Book, as: 'book', attributes: ['id', 'price', 'availableQuantity'] }],
        });
        if (!borrow) throw new NotFoundError('Không tìm thấy phiếu mượn');
        if (!['approved', 'overdue'].includes(borrow.status)) throw new BadRequestError('Phiếu mượn không ở trạng thái đang mượn');
        if (!Object.hasOwn(RETURN_COUNTERS, condition)) throw new BadRequestError('Tình trạng sách không hợp lệ');

        const book = borrow.book || await Book.findByPk(borrow.bookId);
        // Tính trước khi đổi trạng thái; so sánh chuỗi ngày YYYY-MM-DD nên trả đúng ngày hạn không bị tính quá hạn
        const isOverdue = borrow.status === 'overdue' || (borrow.dueDate && borrow.dueDate < today());
        const finalStatus = condition === 'lost' ? 'lost' : 'returned';

        // Chốt phiếu và cộng kho trong một transaction, chỉ ghi khi phiếu vẫn đang mượn (tránh trả trùng)
        await sequelize.transaction(async (transaction) => {
            const [closed] = await Borrow.update(
                { status: finalStatus, returnDate: today(), returnedBy, note: note || borrow.note },
                { where: { id, status: { [Op.in]: ['approved', 'overdue'] } }, transaction }
            );
            if (!closed) throw new BadRequestError('Phiếu mượn không ở trạng thái đang mượn');
            await Book.increment(RETURN_COUNTERS[condition], { where: { id: borrow.bookId }, transaction });
        });

        // Tự động tạo phiếu phạt
        const FineService = require('./fine.service');

        if (condition === 'lost') {
            await FineService.createFine({ borrowId: id, userId: borrow.userId, type: 'lost', bookPrice: book.price, dueDate: borrow.dueDate });
        } else if (condition === 'damaged') {
            await FineService.createFine({ borrowId: id, userId: borrow.userId, type: 'damaged', bookPrice: book.price, dueDate: borrow.dueDate });
            if (isOverdue) await FineService.createFine({ borrowId: id, userId: borrow.userId, type: 'overdue', dueDate: borrow.dueDate });
        } else if (isOverdue) {
            await FineService.createFine({ borrowId: id, userId: borrow.userId, type: 'overdue', dueDate: borrow.dueDate });
        }

        // Thông báo người đầu hàng chờ đặt trước (nếu có)
        if (condition !== 'lost') {
            try {
                const ReservationService = require('./reservation.service');
                await ReservationService.notifyNextInQueue(borrow.bookId);
            } catch (e) { console.error('[RESERVATION] notify error:', e.message); }
        }

        return Borrow.findByPk(id, { include: BORROW_INCLUDES });
    }

    // ── Cập nhật trạng thái quá hạn (chạy hàng ngày) ─────────────
    static async updateOverdue() {
        const [count] = await Borrow.update(
            { status: 'overdue' },
            { where: { status: 'approved', dueDate: { [Op.lt]: today() } } }
        );
        return count;
    }

    // ── Stats tổng quan ────────────────────────────────────────────
    static async getStats() {
        const [pending, approved, overdue, returnedToday] = await Promise.all([
            Borrow.count({ where: { status: 'pending' } }),
            Borrow.count({ where: { status: 'approved' } }),
            Borrow.count({ where: { status: 'overdue' } }),
            Borrow.count({ where: { status: 'returned', returnDate: today() } }),
        ]);
        return { pending, approved, overdue, returnedToday };
    }
    // ── Độc giả gửi yêu cầu gia hạn ──────────────────────────────
    static async requestRenew(id, userId, { renewDueDate, renewNote }) {
        const borrow = await Borrow.findByPk(id);
        if (!borrow) throw new NotFoundError('Không tìm thấy phiếu mượn');
        if (parseInt(borrow.userId) !== parseInt(userId)) throw new BadRequestError('Không có quyền gia hạn phiếu mượn này');
        if (!['approved', 'overdue'].includes(borrow.status)) throw new BadRequestError('Chỉ có thể gia hạn sách đang mượn');
        if (borrow.renewStatus === 'pending') throw new BadRequestError('Bạn đã có yêu cầu gia hạn đang chờ duyệt');
        if (borrow.renewCount >= borrow.renewLimit) throw new BadRequestError(`Đã đạt giới hạn gia hạn (${borrow.renewLimit} lần)`);
        if (!renewDueDate) throw new BadRequestError('Vui lòng chọn ngày trả mới');
        if (new Date(renewDueDate) <= new Date(borrow.dueDate)) throw new BadRequestError('Ngày trả mới phải sau ngày hạn hiện tại');

        await borrow.update({
            renewStatus: 'pending',
            renewDueDate,
            renewNote: renewNote || null,
            renewRequestedAt: new Date(),
        });

        const updated = await Borrow.findByPk(id, { include: BORROW_INCLUDES });

        try {
            const NotificationService = require('./notification.service');
            await NotificationService.notifyAdminNewRenew(updated);
        } catch (e) { console.error('[NOTIF] notifyAdminNewRenew error:', e.message); }

        return updated;
    }

    // ── Thủ thư duyệt gia hạn ────────────────────────────────────
    static async approveRenew(id, approvedBy) {
        const borrow = await Borrow.findByPk(id);
        if (!borrow) throw new NotFoundError('Không tìm thấy phiếu mượn');
        if (borrow.renewStatus !== 'pending') throw new BadRequestError('Không có yêu cầu gia hạn nào đang chờ');

        await borrow.update({
            dueDate: borrow.renewDueDate,          // Cập nhật hạn trả mới
            renewCount: borrow.renewCount + 1,
            renewStatus: 'approved',
            status: 'approved',                    // Đưa về approved nếu đang overdue
            approvedBy,
        });

        const updated = await Borrow.findByPk(id, { include: BORROW_INCLUDES });

        try {
            const NotificationService = require('./notification.service');
            await NotificationService.notifyRenewApproved(updated);
        } catch (e) { console.error('[NOTIF] renew approve error:', e.message); }

        return updated;
    }

    // ── Thủ thư từ chối gia hạn ──────────────────────────────────
    static async rejectRenew(id, { approvedBy, renewNote }) {
        const borrow = await Borrow.findByPk(id);
        if (!borrow) throw new NotFoundError('Không tìm thấy phiếu mượn');
        if (borrow.renewStatus !== 'pending') throw new BadRequestError('Không có yêu cầu gia hạn nào đang chờ');

        await borrow.update({
            renewStatus: 'rejected',
            renewNote: renewNote || 'Yêu cầu gia hạn bị từ chối',
            approvedBy,
        });

        const updated = await Borrow.findByPk(id, { include: BORROW_INCLUDES });

        try {
            const NotificationService = require('./notification.service');
            await NotificationService.notifyRenewRejected(updated);
        } catch (e) { console.error('[NOTIF] renew reject error:', e.message); }

        return updated;
    }

}

module.exports = BorrowService;
