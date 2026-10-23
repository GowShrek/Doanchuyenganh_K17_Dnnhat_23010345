const express = require('express');
const router = express.Router();
const reviewController = require('../controller/review.controller');
const { asyncHandler, authUser, authAdminOrLibrarian } = require('../auth/checkAuth');

// ── Public: xem đánh giá ──────────────────────────────────────────────
router.get('/latest', asyncHandler(reviewController.getLatestPublicReviews));
router.get('/book/:bookId', asyncHandler(reviewController.getByBook));

// ── Độc giả: xem, gửi, xóa đánh giá của mình ─────────────────────
router.get('/book/:bookId/my',    authUser, asyncHandler(reviewController.getMyReview));
router.post('/book/:bookId',      authUser, asyncHandler(reviewController.upsert));
router.delete('/book/:bookId',    authUser, asyncHandler(reviewController.deleteMyReview));

// ── Admin / Thủ thư ────────────────────────────────────────────────
router.get('/',                   authAdminOrLibrarian, asyncHandler(reviewController.getAll));
router.patch('/:id/toggle',       authAdminOrLibrarian, asyncHandler(reviewController.toggleHide));

module.exports = router;
