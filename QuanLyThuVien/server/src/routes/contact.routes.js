const express = require('express');
const router = express.Router();
const ctrl = require('../controller/contact.controller');
const { asyncHandler, authAdminOrLibrarian } = require('../auth/checkAuth');

// Public route: gửi liên hệ
router.post('/', asyncHandler(ctrl.create));

// Admin routes
router.get('/', authAdminOrLibrarian, asyncHandler(ctrl.getAll));
router.patch('/:id/status', authAdminOrLibrarian, asyncHandler(ctrl.updateStatus));
router.delete('/:id', authAdminOrLibrarian, asyncHandler(ctrl.delete));

module.exports = router;
