const express = require('express');
const router = express.Router();
const fineController = require('../controller/fine.controller');
const paymentController = require('../controller/payment.controller');
const { asyncHandler, authUser, authAdminOrLibrarian } = require('../auth/checkAuth');

// ── Thanh toán online (callback không cần auth cookie) ─────────────
router.get('/vnpay/return', asyncHandler(paymentController.vnpayReturn));
router.post('/momo/ipn',    asyncHandler(paymentController.momoIPN));
router.get('/momo/return',  asyncHandler(paymentController.momoReturn));

// ── Độc giả xem + tạo link thanh toán ──────────────────────────────
router.get('/my', authUser, asyncHandler(fineController.getMyFines));
router.post('/:id/payment', authUser, asyncHandler(paymentController.createPaymentUrl));

// ── Admin / Thủ thư ─────────────────────────────────────────────────
router.get('/stats', authAdminOrLibrarian, asyncHandler(fineController.getStats));
router.get('/', authAdminOrLibrarian, asyncHandler(fineController.getAll));
router.get('/:id', authAdminOrLibrarian, asyncHandler(fineController.getById));
router.patch('/:id/pay', authAdminOrLibrarian, asyncHandler(fineController.markPaid));
router.patch('/:id/waive', authAdminOrLibrarian, asyncHandler(fineController.waive));

module.exports = router;
