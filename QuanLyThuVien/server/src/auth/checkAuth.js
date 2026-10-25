const { AuthFailureError } = require('../core/error.response');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../models/index');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Tạo middleware xác thực. Token chỉ chứa id, nên vai trò và trạng thái khóa luôn đọc từ CSDL:
// đổi vai trò hay khóa tài khoản có hiệu lực ngay với cả phiên đang đăng nhập.
// roles = null: chỉ cần đăng nhập; ngược lại vai trò phải nằm trong danh sách.
const authenticate = (roles, missingTokenMessage) => async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new AuthFailureError(missingTokenMessage);

        const decoded = await verifyToken(token);
        const user = await User.findByPk(decoded.id);

        if (!user) throw new AuthFailureError('Vui lòng đăng nhập lại');
        if (roles && !roles.includes(user.role)) {
            throw new AuthFailureError('Bạn không có quyền truy cập');
        }
        if (!user.isActive) {
            throw new AuthFailureError('Tài khoản đã bị khóa');
        }

        // controller/service đọc req.user.role để giới hạn quyền của thủ thư
        req.user = { ...decoded, role: user.role };
        next();
    } catch (error) {
        next(error);
    }
};

// Người dùng đã đăng nhập (mọi vai trò)
const authUser = authenticate(null, 'Vui lòng đăng nhập');
// Chỉ dành cho Admin
const authAdmin = authenticate(['admin'], 'Bạn không có quyền truy cập');
// Chỉ dành cho Thủ thư
const authLibrarian = authenticate(['librarian'], 'Bạn không có quyền truy cập');
// Cho cả Admin và Thủ thư
const authAdminOrLibrarian = authenticate(['admin', 'librarian'], 'Bạn không có quyền truy cập');

module.exports = {
    asyncHandler,
    authUser,
    authAdmin,
    authLibrarian,
    authAdminOrLibrarian,
};
