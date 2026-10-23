const { AuthFailureError } = require('../core/error.response');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../models/index');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Middleware xác thực người dùng đã đăng nhập
const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new AuthFailureError('Vui lòng đăng nhập');

        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware chỉ dành cho Admin
const authAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new AuthFailureError('Bạn không có quyền truy cập');

        const decoded = await verifyToken(token);
        const user = await User.findByPk(decoded.id);

        if (!user || user.role !== 'admin') {
            throw new AuthFailureError('Bạn không có quyền truy cập');
        }
        if (!user.isActive) {
            throw new AuthFailureError('Tài khoản đã bị khóa');
        }

        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware chỉ dành cho Thủ thư
const authLibrarian = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new AuthFailureError('Bạn không có quyền truy cập');

        const decoded = await verifyToken(token);
        const user = await User.findByPk(decoded.id);

        if (!user || user.role !== 'librarian') {
            throw new AuthFailureError('Bạn không có quyền truy cập');
        }
        if (!user.isActive) {
            throw new AuthFailureError('Tài khoản đã bị khóa');
        }

        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware cho cả Admin và Thủ thư
const authAdminOrLibrarian = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) throw new AuthFailureError('Bạn không có quyền truy cập');

        const decoded = await verifyToken(token);
        const user = await User.findByPk(decoded.id);

        if (!user || !['admin', 'librarian'].includes(user.role)) {
            throw new AuthFailureError('Bạn không có quyền truy cập');
        }
        if (!user.isActive) {
            throw new AuthFailureError('Tài khoản đã bị khóa');
        }

        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    asyncHandler,
    authUser,
    authAdmin,
    authLibrarian,
    authAdminOrLibrarian,
};
