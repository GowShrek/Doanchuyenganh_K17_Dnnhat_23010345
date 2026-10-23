const { Op } = require('sequelize');
const { Fine, Borrow, User, Book } = require('../models/index');
const { NotFoundError, BadRequestError } = require('../core/error.response');

// Mức phạt cấu hình
const FINE_CONFIG = {
    OVERDUE_PER_DAY: 2000,   // 2.000đ / ngày quá hạn
    DAMAGED_RATE: 0.30,       // 30% giá sách
    LOST_RATE: 1.0,           // 100% giá sách
    MIN_FINE: 5000,           // Phạt tối thiểu
};

// Tính số ngày quá hạn
const calcOverdueDays = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
};

const FINE_INCLUDES = [
    {
        model: User, as: 'reader',
        attributes: ['id', 'fullName', 'email', 'studentId', 'phone', 'avatar'],
    },
    {
        model: Borrow, as: 'borrow',
        attributes: ['id', 'borrowCode', 'dueDate', 'returnDate', 'status'],
        include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'isbn', 'price', 'coverImage'] }],
    },
];

class FineService {
    // ── Tạo phiếu phạt (gọi từ borrow.service khi trả sách) ───────
    static async createFine({ borrowId, userId, type, bookPrice, dueDate }) {
        let amount = 0;

        if (type === 'overdue') {
            const days = calcOverdueDays(dueDate);
            amount = Math.max(FINE_CONFIG.MIN_FINE, days * FINE_CONFIG.OVERDUE_PER_DAY);
        } else if (type === 'lost') {
            amount = Math.round((bookPrice || 0) * FINE_CONFIG.LOST_RATE) || 100000;
        } else if (type === 'damaged') {
            amount = Math.round((bookPrice || 0) * FINE_CONFIG.DAMAGED_RATE) || 50000;
        }

        const fine = await Fine.create({ borrowId, userId, type, amount, status: 'unpaid' });
        return fine;
    }

    // ── Danh sách phiếu phạt ───────────────────────────────────────
    static async getAll({ status, type, userId, search, page = 1, limit = 10 } = {}) {
        const where = {};
        if (status) where.status = status;
        if (type) where.type = type;
        if (userId) where.userId = userId;

        const { count, rows } = await Fine.findAndCountAll({
            where,
            include: [
                {
                    model: User, as: 'reader',
                    attributes: ['id', 'fullName', 'email', 'studentId', 'phone', 'avatar'],
                    ...(search ? { where: { [Op.or]: [{ fullName: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }, { studentId: { [Op.like]: `%${search}%` } }] } } : {}),
                    required: !!search,
                },
                {
                    model: Borrow, as: 'borrow',
                    attributes: ['id', 'borrowCode', 'dueDate', 'returnDate', 'status'],
                    include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'isbn', 'price', 'coverImage'] }],
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            distinct: true,
        });

        return { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit), fines: rows };
    }

    // ── Phiếu phạt của độc giả ─────────────────────────────────────
    static async getMyFines({ userId, status, page = 1, limit = 10 }) {
        const where = { userId };
        if (status) where.status = status;

        const { count, rows } = await Fine.findAndCountAll({
            where,
            include: [{
                model: Borrow, as: 'borrow',
                attributes: ['id', 'borrowCode', 'dueDate'],
                include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'coverImage'] }],
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        return { total: count, page: parseInt(page), fines: rows };
    }

    // ── Chi tiết phiếu phạt ────────────────────────────────────────
    static async getById(id) {
        const fine = await Fine.findByPk(id, { include: FINE_INCLUDES });
        if (!fine) throw new NotFoundError('Không tìm thấy phiếu phạt');
        return fine;
    }

    // ── Xác nhận thu tiền ─────────────────────────────────────────
    static async markPaid(id, paidBy) {
        const fine = await Fine.findByPk(id);
        if (!fine) throw new NotFoundError('Không tìm thấy phiếu phạt');
        if (fine.status !== 'unpaid') throw new BadRequestError('Phiếu phạt này đã được xử lý');

        await fine.update({ status: 'paid', paidAmount: fine.amount, paidAt: new Date(), paidBy });
        return Fine.findByPk(id, { include: FINE_INCLUDES });
    }

    // ── Miễn phạt ─────────────────────────────────────────────────
    static async waive(id, { reason, paidBy }) {
        const fine = await Fine.findByPk(id);
        if (!fine) throw new NotFoundError('Không tìm thấy phiếu phạt');
        if (fine.status !== 'unpaid') throw new BadRequestError('Phiếu phạt này đã được xử lý');

        await fine.update({ status: 'waived', reason: reason || 'Được miễn phạt', paidBy, paidAt: new Date() });
        return Fine.findByPk(id, { include: FINE_INCLUDES });
    }

    // ── Thống kê tổng quan ─────────────────────────────────────────
    static async getStats() {
        const { sequelize } = require('../config/connectDB');
        const [[result]] = await sequelize.query(`
            SELECT
                COUNT(*) as totalCount,
                SUM(amount) as totalAmount,
                SUM(CASE WHEN status = 'unpaid'  THEN amount ELSE 0 END) as unpaidAmount,
                SUM(CASE WHEN status = 'paid'    THEN amount ELSE 0 END) as paidAmount,
                SUM(CASE WHEN status = 'waived'  THEN amount ELSE 0 END) as waivedAmount,
                COUNT(CASE WHEN status = 'unpaid' THEN 1 END) as unpaidCount,
                COUNT(CASE WHEN status = 'paid'   THEN 1 END) as paidCount,
                COUNT(CASE WHEN status = 'waived' THEN 1 END) as waivedCount
            FROM fines
        `);
        return result;
    }
}

module.exports = FineService;
