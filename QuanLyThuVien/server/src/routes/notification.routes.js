const express = require('express');
const router = express.Router();
const ctrl = require('../controller/notification.controller');
const { asyncHandler, authUser, authAdminOrLibrarian } = require('../auth/checkAuth');

// Độc giả
router.get('/',                 authUser, asyncHandler(ctrl.getMyNotifications));
router.patch('/:id/read',       authUser, asyncHandler(ctrl.markRead));
router.patch('/read-all',       authUser, asyncHandler(ctrl.markAllRead));
router.delete('/:id',           authUser, asyncHandler(ctrl.delete));

// Admin: trigger job thủ công
router.post('/trigger-overdue', authAdminOrLibrarian, asyncHandler(ctrl.triggerOverdueReminders));

module.exports = router;
