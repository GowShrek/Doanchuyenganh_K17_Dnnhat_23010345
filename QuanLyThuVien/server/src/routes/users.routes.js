const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/avatars');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });
const userController = require('../controller/user.controller');
const { asyncHandler, authUser, authAdmin, authLibrarian, authAdminOrLibrarian } = require('../auth/checkAuth');

// ===================== PUBLIC ROUTES =====================
router.post('/register', asyncHandler(userController.createUser));
router.post('/login', asyncHandler(userController.login));
router.post('/login-google', asyncHandler(userController.loginGoogle));
router.get('/refresh-token', asyncHandler(userController.refreshToken));
router.post('/forgot-password', asyncHandler(userController.forgotPassword));
router.post('/reset-password', asyncHandler(userController.resetPassword));

// ===================== USER ROUTES (đã đăng nhập) =====================
router.get('/auth', authUser, asyncHandler(userController.auth));
router.post('/logout', authUser, asyncHandler(userController.logout));
router.put('/update', authUser, asyncHandler(userController.updateUser));
router.post('/change-password', authUser, asyncHandler(userController.changePassword));
router.post(
    '/upload-avatar',
    authUser,
    upload.single('avatar'),
    asyncHandler(userController.uploadAvatar)
);

// ===================== ADMIN ROUTES =====================
// Lấy danh sách users (có lọc theo role, tìm kiếm)
router.get('/admin/users', authAdminOrLibrarian, asyncHandler(userController.getAllUser));
// Tạo tài khoản bất kỳ role (admin/librarian/reader)
router.post('/admin/users', authAdminOrLibrarian, asyncHandler(userController.createUserByAdmin));
// Cập nhật user
router.put('/admin/users/:id', authAdminOrLibrarian, asyncHandler(userController.updateUserAdmin));
// Khóa / mở tài khoản
router.patch('/admin/users/:id/toggle-active', authAdminOrLibrarian, asyncHandler(userController.toggleUserActive));
// Xóa user (CHỈ ADMIN)
router.delete('/admin/users/:id', authAdmin, asyncHandler(userController.deleteUser));

// ===================== ADMIN + THỦ THƯ ROUTES =====================
// Lấy danh sách độc giả (dành cho thủ thư xem)
router.get('/staff/readers', authAdminOrLibrarian, asyncHandler(async (req, res) => {
    const { search, page, limit } = req.query;
    const { OK } = require('../core/success.response');
    const UserService = require('../services/users.service');
    const data = await UserService.getAllUser({ role: 'reader', search, page, limit });
    new OK({ message: 'success', metadata: data }).send(res);
}));

module.exports = router;
