const express = require('express');
const router = express.Router();
const ctrl = require('../controller/systemConfig.controller');
const { asyncHandler, authAdmin } = require('../auth/checkAuth');

// Chỉ Admin được xem và sửa cấu hình (khóa API, OAuth, email gửi OTP)
router.get('/', authAdmin, asyncHandler(ctrl.getAll));
router.put('/', authAdmin, asyncHandler(ctrl.update));

module.exports = router;
