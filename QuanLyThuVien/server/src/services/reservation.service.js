const { Op } = require('sequelize');
const { Reservation, Book, User, Borrow } = require('../models/index');
const { NotFoundError, BadRequestError } = require('../core/error.response');

const READER_ATTRS = ['id', 'fullName', 'email', 'studentId', 'phone', 'avatar'];
const BOOK_ATTRS   = ['id', 'title', 'isbn', 'coverImage', 'availableQuantity'];
const INCLUDE_ALL  = [
    { model: Book, as: 'book',   attributes: BOOK_ATTRS },
    { model: User, as: 'reader', attributes: READER_ATTRS },
];

// Thời gian giữ chỗ sau thông báo: 48 giờ
const HOLD_HOURS = 48;

class ReservationService {
    // ── Độc giả đặt trước ─────────────────────────────────────────
    static async create(bookId, userId, { note } = {}) {
        const book = await Book.findByPk(bookId);
        if (!book) throw new NotFoundError('Không tìm thấy sách');
        if (!book.isActive) throw new BadRequestError('Sách hiện không hoạt động');

        // Nếu còn sách → khuyên mượn trực tiếp thay vì đặt trước
        if (book.availableQuantity > 0) {
            throw new BadRequestError('Sách vẫn còn trong kho, bạn có thể mượn trực tiếp');
        }

        // Kiểm tra đã đặt trước chưa
        const existing = await Reservation.findOne({
            where: { bookId, userId, status: { [Op.in]: ['pending', 'notified'] } },
        });
        if (existing) throw new BadRequestError('Bạn đã đặt trước sách này rồi');

        // Lấy vị trí hàng chờ
        const queueCount = await Reservation.count({
            where: { bookId, status: { [Op.in]: ['pending', 'notified'] } },
        });

        const reservation = await Reservation.create({
            bookId,
            userId,
            queuePosition: queueCount + 1,
            status: 'pending',
            note: note || null,
        });

        return Reservation.findByPk(reservation.id, { include: INCLUDE_ALL });
    }

    // ── Xem đặt trước của độc giả ─────────────────────────────────
    static async getMyReservations(userId, { page = 1, limit = 10 } = {}) {
        const { count, rows } = await Reservation.findAndCountAll({
            where: { userId },
            include: [{ model: Book, as: 'book', attributes: BOOK_ATTRS }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });
        return { total: count, page: parseInt(page), reservations: rows };
    }

    // ── Độc giả hủy đặt trước ─────────────────────────────────────
    static async cancel(id, userId) {
        const res = await Reservation.findByPk(id);
        if (!res) throw new NotFoundError('Không tìm thấy đặt trước');
        if (parseInt(res.userId) !== parseInt(userId)) throw new BadRequestError('Không có quyền hủy');
        if (!['pending', 'notified'].includes(res.status)) throw new BadRequestError('Không thể hủy đặt trước ở trạng thái này');

        await res.update({ status: 'cancelled' });

        // Cập nhật lại vị trí hàng chờ cho những người sau
        await ReservationService._reorderQueue(res.bookId);

        return { cancelled: true };
    }

    // ── Khi có sách được trả → thông báo người đầu hàng ──────────
    static async notifyNextInQueue(bookId) {
        const next = await Reservation.findOne({
            where: { bookId, status: 'pending' },
            order: [['queuePosition', 'ASC']],
            include: [{ model: User, as: 'reader', attributes: READER_ATTRS }],
        });

        if (!next) return null; // Không có ai trong hàng chờ

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + HOLD_HOURS);

        await next.update({ status: 'notified', notifiedAt: new Date(), expiresAt });
        console.log(`[RESERVATION] Notified user ${next.userId} for book ${bookId}, expires: ${expiresAt.toISOString()}`);

        // Gửi thông báo trong ứng dụng
        try {
            const NotificationService = require('./notification.service');
            await NotificationService.notifyReservationReady(next);
        } catch (e) { console.error('[NOTIF] reservation ready error:', e.message); }

        return next;
    }

    // ── Khi độc giả được duyệt mượn → đánh dấu fulfilled ─────────
    static async markFulfilled(bookId, userId) {
        const res = await Reservation.findOne({
            where: { bookId, userId, status: 'notified' },
        });
        if (res) await res.update({ status: 'fulfilled' });
    }

    // ── Admin: xem tất cả đặt trước ───────────────────────────────
    static async getAll({ bookId, status, page = 1, limit = 10 } = {}) {
        const where = {};
        if (bookId) where.bookId = bookId;
        if (status) where.status = status;

        const { count, rows } = await Reservation.findAndCountAll({
            where,
            include: INCLUDE_ALL,
            order: [['bookId', 'ASC'], ['queuePosition', 'ASC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            distinct: true,
        });
        return { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit), reservations: rows };
    }

    // ── Admin: hủy đặt trước ──────────────────────────────────────
    static async adminCancel(id) {
        const res = await Reservation.findByPk(id);
        if (!res) throw new NotFoundError('Không tìm thấy đặt trước');
        await res.update({ status: 'cancelled' });
        await ReservationService._reorderQueue(res.bookId);
        return { cancelled: true };
    }

    // ── Kiểm tra đặt trước của user cho một cuốn sách ─────────────
    static async getMyReservationForBook(bookId, userId) {
        return Reservation.findOne({
            where: { bookId, userId, status: { [Op.in]: ['pending', 'notified'] } },
        });
    }

    // ── Số người đang chờ đặt trước của 1 sách ───────────────────
    static async getQueueInfo(bookId) {
        const count = await Reservation.count({
            where: { bookId, status: { [Op.in]: ['pending', 'notified'] } },
        });
        return { bookId, queueCount: count };
    }

    // ── Tự động expire các đặt trước hết hạn ─────────────────────
    static async expireOldReservations() {
        const now = new Date();
        const [count] = await Reservation.update(
            { status: 'expired' },
            { where: { status: 'notified', expiresAt: { [Op.lt]: now } } }
        );
        if (count > 0) console.log(`[RESERVATION] Expired ${count} reservations`);
        return count;
    }

    // ── Helper: sắp xếp lại queue sau khi hủy ────────────────────
    static async _reorderQueue(bookId) {
        const pending = await Reservation.findAll({
            where: { bookId, status: 'pending' },
            order: [['queuePosition', 'ASC']],
        });
        for (let i = 0; i < pending.length; i++) {
            if (pending[i].queuePosition !== i + 1) {
                await pending[i].update({ queuePosition: i + 1 });
            }
        }
    }
}

module.exports = ReservationService;
