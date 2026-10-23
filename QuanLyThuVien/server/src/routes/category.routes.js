const express = require('express');
const router = express.Router();
const CategoryController = require('../controller/category.controller');
const { asyncHandler, authAdmin, authAdminOrLibrarian } = require('../auth/checkAuth');

// Public - ai cũng có thể xem danh mục
router.get('/', asyncHandler(CategoryController.getAll));
router.get('/:id', asyncHandler(CategoryController.getById));

// Protected - chỉ Admin hoặc Thủ thư mới được thêm/sửa
router.post('/', authAdminOrLibrarian, asyncHandler(CategoryController.create));
router.put('/:id', authAdminOrLibrarian, asyncHandler(CategoryController.update));
router.patch('/:id/toggle', authAdminOrLibrarian, asyncHandler(CategoryController.toggleActive));

// Chỉ Admin mới được xóa
router.delete('/:id', authAdmin, asyncHandler(CategoryController.delete));

module.exports = router;
