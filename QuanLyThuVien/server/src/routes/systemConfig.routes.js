const express = require('express');
const router = express.Router();
const ctrl = require('../controller/systemConfig.controller');
const { asyncHandler, authAdminOrLibrarian } = require('../auth/checkAuth');

// Chỉ có Admin hoặc Librarian được phép lấy và cấu hình
router.get('/', authAdminOrLibrarian, asyncHandler(ctrl.getAll));
router.put('/', authAdminOrLibrarian, asyncHandler(ctrl.update));

module.exports = router;
