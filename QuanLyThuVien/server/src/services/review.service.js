const { Op } = require('sequelize');
const { Review, User, Book } = require('../models/index');
const { NotFoundError, BadRequestError } = require('../core/error.response');

const REVIEWER_ATTRS = ['id', 'fullName', 'avatar', 'studentId'];

class ReviewService {
    // ── Lấy đánh giá của một cuốn sách ────────────────────────────
    static async getByBook(bookId, { page = 1, limit = 10 } = {}) {
        const book = await Book.findByPk(bookId);
        if (!book) throw new NotFoundError('Không tìm thấy sách');

        const { count, rows } = await Review.findAndCountAll({
            where: { bookId, isHidden: false },
            include: [{ model: User, as: 'reviewer', attributes: REVIEWER_ATTRS }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
        });

        // Tính điểm trung bình
        const allRatings = await Review.findAll({
            where: { bookId, isHidden: false },
            attributes: ['rating'],
        });
        const totalRatings = allRatings.length;
        const avgRating = totalRatings > 0
            ? (allRatings.reduce((s, r) => s + r.rating, 0) / totalRatings).toFixed(1)
            : 0;

        // Phân bổ sao (1-5)
        const distribution = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: allRatings.filter(r => r.rating === star).length,
        }));

        return {
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            avgRating: parseFloat(avgRating),
            totalRatings,
            distribution,
            reviews: rows,
        };
    }

    // ── Đánh giá của user hiện tại cho sách ────────────────────────
    static async getMyReview(bookId, userId) {
        return Review.findOne({ where: { bookId, userId } });
    }

    // ── Tạo hoặc cập nhật đánh giá ────────────────────────────────
    static async upsert(bookId, userId, { rating, comment }) {
        const book = await Book.findByPk(bookId);
        if (!book) throw new NotFoundError('Không tìm thấy sách');
        if (!rating || rating < 1 || rating > 5) throw new BadRequestError('Điểm đánh giá phải từ 1 đến 5');

        const [review, created] = await Review.findOrCreate({
            where: { bookId, userId },
            defaults: { rating, comment: comment?.trim() || null },
        });

        if (!created) {
            await review.update({ rating, comment: comment?.trim() || null });
        }

        const updated = await Review.findByPk(review.id, {
            include: [{ model: User, as: 'reviewer', attributes: REVIEWER_ATTRS }],
        });

        return { review: updated, created };
    }

    // ── Xóa đánh giá (độc giả xóa của mình) ──────────────────────
    static async deleteMyReview(bookId, userId) {
        const review = await Review.findOne({ where: { bookId, userId } });
        if (!review) throw new NotFoundError('Không tìm thấy đánh giá');
        await review.destroy();
        return { deleted: true };
    }

    // ── Admin: ẩn/hiện đánh giá ────────────────────────────────────
    static async toggleHide(reviewId) {
        const review = await Review.findByPk(reviewId);
        if (!review) throw new NotFoundError('Không tìm thấy đánh giá');
        await review.update({ isHidden: !review.isHidden });
        return review;
    }

    // ── Admin: lấy tất cả đánh giá ────────────────────────────────
    static async getAll({ bookId, search, page = 1, limit = 10 } = {}) {
        const where = {};
        if (bookId) where.bookId = bookId;

        const { count, rows } = await Review.findAndCountAll({
            where,
            include: [
                { model: User, as: 'reviewer', attributes: REVIEWER_ATTRS },
                { model: Book, as: 'book', attributes: ['id', 'title', 'coverImage'] },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            distinct: true,
        });

        return { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit), reviews: rows };
    }
    // ── Lấy các đánh giá mới nhất (dành cho trang chủ) ────────────────
    static async getLatestPublic({ limit = 3 } = {}) {
        const rows = await Review.findAll({
            where: { isHidden: false, rating: { [Op.gte]: 4 } }, // Chỉ lấy đánh giá >= 4 sao
            include: [
                { model: User, as: 'reviewer', attributes: REVIEWER_ATTRS },
                { model: Book, as: 'book', attributes: ['id', 'title'] },
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
        });
        return { reviews: rows };
    }
}

module.exports = ReviewService;
