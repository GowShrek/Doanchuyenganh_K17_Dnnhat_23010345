const express = require('express');
const router = express.Router();
const ctrl = require('../controller/reservation.controller');
const { asyncHandler, authUser, authAdminOrLibrarian } = require('../auth/checkAuth');

// ── Public: số người xếp hàng ─────────────────────────────────────
router.get('/queue/:bookId', asyncHandler(ctrl.getQueueInfo));

// ── Độc giả ───────────────────────────────────────────────────────
router.post('/book/:bookId',      authUser, asyncHandler(ctrl.create));
router.get('/my',                 authUser, asyncHandler(ctrl.getMyReservations));
router.get('/book/:bookId/my',    authUser, asyncHandler(ctrl.getMyReservationForBook));
router.patch('/:id/cancel',       authUser, asyncHandler(ctrl.cancel));

// ── Admin / Thủ thư ────────────────────────────────────────────────
router.get('/',                   authAdminOrLibrarian, asyncHandler(ctrl.getAll));
router.patch('/:id/admin-cancel', authAdminOrLibrarian, asyncHandler(ctrl.adminCancel));

module.exports = router;
