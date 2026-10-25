const express = require('express');
const router = express.Router();
const BookController = require('../controller/book.controller');
const { asyncHandler, authAdmin, authAdminOrLibrarian } = require('../auth/checkAuth');

// Public - ai cũng xem được (chỉ sách đang hiển thị)
router.get('/', asyncHandler(BookController.getAll));
// Staff - danh sách gồm cả sách đang ẩn (đặt trước '/:id')
router.get('/manage', authAdminOrLibrarian, asyncHandler(BookController.getAllForStaff));
router.get('/:id', asyncHandler(BookController.getById));

// Staff - thêm/sửa
router.post('/', authAdminOrLibrarian, asyncHandler(BookController.create));
router.put('/:id', authAdminOrLibrarian, asyncHandler(BookController.update));
router.patch('/:id/toggle', authAdminOrLibrarian, asyncHandler(BookController.toggleActive));

// Admin only - xóa
router.delete('/:id', authAdmin, asyncHandler(BookController.delete));

module.exports = router;
