const { Op } = require('sequelize');
const { Notification, Borrow, Book, User } = require('../models/index');

class NotificationService {
    // ── Tạo thông báo ─────────────────────────────────────────────
    static async create({ userId, type, title, body, link = null, refId = null }) {
        return Notification.create({ userId, type, title, body, link, refId });
    }

    // ── Xem thông báo của user ─────────────────────────────────────
    static async getForUser(userId, { page = 1, limit = 20, unreadOnly = false } = {}) {
        const where = { userId };
        if (unreadOnly) where.isRead = false;

        const { count, rows } = await Notification.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });
        return { total: count, unread: await NotificationService.countUnread(userId), notifications: rows };
    }

    // ── Đếm chưa đọc ──────────────────────────────────────────────
    static async countUnread(userId) {
        return Notification.count({ where: { userId, isRead: false } });
    }

    // ── Đánh dấu đã đọc ───────────────────────────────────────────
    static async markRead(id, userId) {
        const n = await Notification.findOne({ where: { id, userId } });
        if (n) await n.update({ isRead: true });
        return { ok: true };
    }

    // ── Đánh dấu tất cả đã đọc ────────────────────────────────────
    static async markAllRead(userId) {
        await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
        return { ok: true };
    }

    // ── Xóa ───────────────────────────────────────────────────────
    static async delete(id, userId) {
        await Notification.destroy({ where: { id, userId } });
        return { ok: true };
    }

    // ══════════════════════════════════════════════════════════════
    // FACTORY METHODS — gọi từ BorrowService / ReservationService
    // ══════════════════════════════════════════════════════════════

    // Phiếu mượn được duyệt
    static async notifyBorrowApproved(borrow) {
        return NotificationService.create({
            userId: borrow.userId,
            type: 'borrow_approved',
            title: 'Phiếu mượn được duyệt',
            body: `Phiếu mượn "${borrow.book?.title || 'sách'}" đã được thủ thư duyệt. Hạn trả: ${borrow.dueDate}.`,
            link: '/my/borrows',
            refId: borrow.id,
        });
    }

    // Phiếu mượn bị từ chối
    static async notifyBorrowRejected(borrow) {
        return NotificationService.create({
            userId: borrow.userId,
            type: 'borrow_rejected',
            title: 'Phiếu mượn bị từ chối',
            body: `Yêu cầu mượn "${borrow.book?.title || 'sách'}" đã bị từ chối.${borrow.note ? ' Lý do: ' + borrow.note : ''}`,
            link: '/my/borrows',
            refId: borrow.id,
        });
    }

    // Gia hạn được duyệt
    static async notifyRenewApproved(borrow) {
        return NotificationService.create({
            userId: borrow.userId,
            type: 'renew_approved',
            title: 'Gia hạn được duyệt',
            body: `Yêu cầu gia hạn "${borrow.book?.title || 'sách'}" đã được duyệt. Hạn trả mới: ${borrow.dueDate}.`,
            link: '/my/borrows',
            refId: borrow.id,
        });
    }

    // Gia hạn bị từ chối
    static async notifyRenewRejected(borrow) {
        return NotificationService.create({
            userId: borrow.userId,
            type: 'renew_rejected',
            title: 'Gia hạn bị từ chối',
            body: `Yêu cầu gia hạn "${borrow.book?.title || 'sách'}" bị từ chối.${borrow.renewNote ? ' Lý do: ' + borrow.renewNote : ''}`,
            link: '/my/borrows',
            refId: borrow.id,
        });
    }

    // Đặt trước — sách đã có
    static async notifyReservationReady(reservation) {
        const bookTitle = reservation.book?.title || 'sách bạn đặt trước';
        const expiresAt = reservation.expiresAt
            ? new Date(reservation.expiresAt).toLocaleDateString('vi-VN')
            : 'sớm nhất có thể';
        return NotificationService.create({
            userId: reservation.userId,
            type: 'reservation_ready',
            title: 'Sách đặt trước đã có!',
            body: `"${bookTitle}" đã có sẵn. Vui lòng đến mượn trước ${expiresAt} để không mất lượt.`,
            link: `/books/${reservation.bookId}`,
            refId: reservation.id,
        });
    }

    // Admin: Yêu cầu mượn mới
    static async notifyAdminNewBorrow(borrow) {
        const admins = await User.findAll({ where: { role: { [Op.in]: ['admin', 'librarian'] } } });
        for (const admin of admins) {
            await NotificationService.create({
                userId: admin.id,
                type: 'admin_new_borrow',
                title: 'Yêu cầu mượn sách mới',
                body: `Độc giả "${borrow.reader?.fullName || 'ẩn danh'}" gửi yêu cầu mượn "${borrow.book?.title || 'sách'}".`,
                link: '/admin/borrows',
                refId: borrow.id,
            });
        }
    }

    // Admin: Yêu cầu gia hạn mới
    static async notifyAdminNewRenew(borrow) {
        const admins = await User.findAll({ where: { role: { [Op.in]: ['admin', 'librarian'] } } });
        for (const admin of admins) {
            await NotificationService.create({
                userId: admin.id,
                type: 'admin_new_renew',
                title: 'Yêu cầu gia hạn sách',
                body: `Độc giả "${borrow.reader?.fullName || 'ẩn danh'}" xin gia hạn "${borrow.book?.title || 'sách'}".`,
                link: '/admin/borrows',
                refId: borrow.id,
            });
        }
    }

    // Phiếu phạt mới
    static async notifyFineCreated(fine, bookTitle) {
        return NotificationService.create({
            userId: fine.userId,
            type: 'fine_created',
            title: 'Phiếu phạt mới',
            body: `Bạn có phiếu phạt ${Number(fine.amount).toLocaleString('vi-VN')}đ cho "${bookTitle || 'sách'}". Vui lòng thanh toán sớm.`,
            link: '/my/fines',
            refId: fine.id,
        });
    }

    // ── JOB: Nhắc quá hạn (chạy hàng ngày) ───────────────────────
    static async sendOverdueReminders() {
        // Cập nhật phiếu quá hạn và thu hồi giữ chỗ hết 48 giờ trước khi nhắc
        // (dùng chung cho tác vụ 8:00 và nút kích hoạt thủ công)
        await require('./borrow.service').updateOverdue();
        await require('./reservation.service').expireOldReservations();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tìm sách sắp quá hạn (còn 1 ngày và còn 3 ngày)
        const warnDays = [1, 3];
        let notified = 0;

        for (const days of warnDays) {
            const targetDate = new Date(today);
            targetDate.setDate(targetDate.getDate() + days);
            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);

            const borrows = await Borrow.findAll({
                where: {
                    status: 'approved',
                    dueDate: { [Op.gte]: targetDate.toISOString().split('T')[0], [Op.lt]: nextDay.toISOString().split('T')[0] },
                },
                include: [
                    { model: Book, as: 'book', attributes: ['id', 'title'] },
                    { model: User, as: 'reader', attributes: ['id'] },
                ],
            });

            for (const b of borrows) {
                // Tránh spam: kiểm tra chưa có thông báo loại này trong ngày
                const exists = await Notification.findOne({
                    where: {
                        userId: b.userId,
                        type: 'overdue_warning',
                        refId: b.id,
                        createdAt: { [Op.gte]: today },
                    },
                });
                if (exists) continue;

                await NotificationService.create({
                    userId: b.userId,
                    type: 'overdue_warning',
                    title: `Sắp đến hạn trả sách (còn ${days} ngày)`,
                    body: `"${b.book?.title || 'Sách'}" cần trả trước ${b.dueDate}. Vui lòng trả đúng hạn.`,
                    link: '/my/borrows',
                    refId: b.id,
                });
                notified++;
            }
        }

        // Tìm sách đã quá hạn (chưa trả) — nhắc hàng ngày (tối đa 1 lần/ngày)
        const overdue = await Borrow.findAll({
            where: { status: 'overdue' },
            include: [
                { model: Book, as: 'book', attributes: ['id', 'title'] },
            ],
        });

        for (const b of overdue) {
            const exists = await Notification.findOne({
                where: {
                    userId: b.userId,
                    type: 'overdue_notice',
                    refId: b.id,
                    createdAt: { [Op.gte]: today },
                },
            });
            if (exists) continue;

            const daysLate = Math.floor((Date.now() - new Date(b.dueDate)) / 86400000);
            await NotificationService.create({
                userId: b.userId,
                type: 'overdue_notice',
                title: 'Sách quá hạn — cần trả ngay!',
                body: `"${b.book?.title || 'Sách'}" đã quá hạn ${daysLate} ngày. Tiền phạt đang tăng dần. Vui lòng trả ngay!`,
                link: '/my/borrows',
                refId: b.id,
            });
            notified++;
        }

        console.log(`[NOTIFICATION] Overdue reminders sent: ${notified}`);
        return notified;
    }
}

module.exports = NotificationService;
