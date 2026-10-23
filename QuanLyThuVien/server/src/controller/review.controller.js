const ReviewService = require('../services/review.service');
const { OK } = require('../core/success.response');

class ReviewController {
    // GET /api/reviews/book/:bookId
    getByBook = async (req, res) => {
        const data = await ReviewService.getByBook(req.params.bookId, req.query);
        return new OK({ message: 'Lấy đánh giá thành công', metadata: data }).send(res);
    };

    // GET /api/reviews/book/:bookId/my
    getMyReview = async (req, res) => {
        const review = await ReviewService.getMyReview(req.params.bookId, req.user.id);
        return new OK({ message: 'OK', metadata: { review } }).send(res);
    };

    // POST /api/reviews/book/:bookId  — tạo hoặc cập nhật
    upsert = async (req, res) => {
        const data = await ReviewService.upsert(req.params.bookId, req.user.id, req.body);
        return new OK({ message: data.created ? 'Đánh giá thành công' : 'Cập nhật đánh giá thành công', metadata: data }).send(res);
    };

    // DELETE /api/reviews/book/:bookId
    deleteMyReview = async (req, res) => {
        const data = await ReviewService.deleteMyReview(req.params.bookId, req.user.id);
        return new OK({ message: 'Đã xóa đánh giá', metadata: data }).send(res);
    };

    // PATCH /api/reviews/:id/toggle — Admin ẩn/hiện
    toggleHide = async (req, res) => {
        const data = await ReviewService.toggleHide(req.params.id);
        return new OK({ message: 'Cập nhật thành công', metadata: data }).send(res);
    };

    // GET /api/reviews — Admin xem tất cả
    getAll = async (req, res) => {
        const data = await ReviewService.getAll(req.query);
        return new OK({ message: 'OK', metadata: data }).send(res);
    };

    // GET /api/reviews/latest — Public
    getLatestPublicReviews = async (req, res) => {
        const data = await ReviewService.getLatestPublic(req.query);
        return new OK({ message: 'OK', metadata: data }).send(res);
    };
}

module.exports = new ReviewController();
