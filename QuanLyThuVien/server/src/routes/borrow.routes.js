const express = require('express');
const router = express.Router();
const borrowController = require('../controller/borrow.controller');
const { asyncHandler, authUser, authAdminOrLibrarian } = require('../auth/checkAuth');

// ── Độc giả ───────────────────────────────────────────────────────
// Gửi yêu cầu mượn sách
router.post('/', authUser, asyncHandler(borrowController.requestBorrow));
// Xem lịch sử mượn của bản thân
router.get('/my', authUser, asyncHandler(borrowController.getMyBorrows));

// ── Admin / Thủ thư ───────────────────────────────────────────────
// Stats tổng quan
router.get('/stats', authAdminOrLibrarian, asyncHandler(borrowController.getStats));
// Danh sách tất cả phiếu mượn (filter: status, userId, bookId, search, page)
router.get('/', authAdminOrLibrarian, asyncHandler(borrowController.getAll));
// Chi tiết 1 phiếu
router.get('/:id', authAdminOrLibrarian, asyncHandler(borrowController.getById));
// Duyệt phiếu mượn
router.patch('/:id/approve', authAdminOrLibrarian, asyncHandler(borrowController.approve));
// Từ chối phiếu mượn
router.patch('/:id/reject', authAdminOrLibrarian, asyncHandler(borrowController.reject));
// Xác nhận trả sách
router.patch('/:id/return', authAdminOrLibrarian, asyncHandler(borrowController.returnBook));
// ── Gia hạn sách ──────────────────────────────────────────────────
// Độc giả gửi yêu cầu gia hạn
router.post('/:id/renew', authUser, asyncHandler(borrowController.requestRenew));
// Thủ thư duyệt gia hạn
router.patch('/:id/approve-renew', authAdminOrLibrarian, asyncHandler(borrowController.approveRenew));
// Thủ thư từ chối gia hạn
router.patch('/:id/reject-renew', authAdminOrLibrarian, asyncHandler(borrowController.rejectRenew));

module.exports = router;
