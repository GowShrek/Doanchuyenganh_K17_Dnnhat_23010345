const { BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const UserService = require('../services/users.service');

function setCookie(res, token, refreshToken) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 15 * 60 * 1000, // 15 phút
    });

    res.cookie('logged', 1, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

class UserController {
    // Đăng ký độc giả (tự đăng ký)
    async createUser(req, res) {
        const { fullName, email, password, studentId, department, className, phone } = req.body;
        if (!fullName || !email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        const { token, refreshToken } = await UserService.createUser({
            fullName,
            email,
            password,
            studentId,
            department,
            className,
            phone,
        });

        setCookie(res, token, refreshToken);
        return new OK({ message: 'Đăng ký thành công', metadata: { token, refreshToken } }).send(res);
    }

    // Đăng nhập
    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const { token, refreshToken } = await UserService.login({ email, password });
        setCookie(res, token, refreshToken);
        return new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    // Lấy thông tin user đang đăng nhập
    async auth(req, res) {
        const { id } = req.user;
        const data = await UserService.authUser(id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // Đăng xuất
    async logout(req, res) {
        const { id } = req.user;
        const { status } = await UserService.logout(id);
        if (status === 200) {
            res.clearCookie('token');
            res.clearCookie('refreshToken');
            res.clearCookie('logged');
            return new OK({ message: 'Đăng xuất thành công' }).send(res);
        } else {
            throw new BadRequestError('Đăng xuất thất bại');
        }
    }

    // Refresh token
    async refreshToken(req, res) {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            throw new BadRequestError('Vui lòng đăng nhập lại');
        }
        const { token } = await UserService.refreshToken(refreshToken);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 15 * 60 * 1000,
        });
        res.cookie('logged', 1, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return new OK({ message: 'success', metadata: { token } }).send(res);
    }

    // Đăng nhập Google
    async loginGoogle(req, res) {
        const { credential } = req.body;
        const { token, refreshToken } = await UserService.loginGoogle(credential);
        setCookie(res, token, refreshToken);
        new OK({ message: 'success', metadata: { token, refreshToken } }).send(res);
    }

    // Quên mật khẩu
    async forgotPassword(req, res) {
        const { email } = req.body;
        const { token } = await UserService.forgotPassword(email);
        res.cookie('tokenResetPassword', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 10 * 60 * 1000,
        });
        // OTP chỉ gửi qua email, không trả trong phản hồi API
        new OK({ message: 'success', metadata: { token } }).send(res);
    }

    // Đặt lại mật khẩu
    async resetPassword(req, res) {
        const token = req.cookies.tokenResetPassword;
        const { otp, newPassword } = req.body;
        const data = await UserService.resetPassword(token, otp, newPassword);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // Cập nhật thông tin cá nhân
    async updateUser(req, res) {
        const { id } = req.user;
        const { fullName, address, phone, birthDay, email, studentId, department, className } = req.body;
        const newData = await UserService.updateUser(id, {
            fullName,
            address,
            phone,
            birthDay,
            email,
            studentId,
            department,
            className,
        });
        new OK({ message: 'success', metadata: newData }).send(res);
    }

    // Đổi mật khẩu
    async changePassword(req, res) {
        const { id } = req.user;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const newData = await UserService.changePassword(id, { currentPassword, newPassword });
        new OK({ message: 'success', metadata: newData }).send(res);
    }

    // Upload avatar
    async uploadAvatar(req, res) {
        const { id } = req.user;
        const { filename } = req.file;
        const data = await UserService.uploadAvatar(id, filename);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // ===================== ADMIN ENDPOINTS =====================

    // Lấy danh sách tất cả user
    async getAllUser(req, res) {
        let { role, search, page, limit } = req.query;
        // Thủ thư chỉ được xem danh sách độc giả
        if (req.user.role === 'librarian') {
            role = 'reader';
        }
        const data = await UserService.getAllUser({ role, search, page, limit });
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // Admin tạo tài khoản thủ thư / admin / độc giả
    async createUserByAdmin(req, res) {
        let { fullName, email, password, role } = req.body;
        if (!fullName || !email || !password || !role) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        // Thủ thư chỉ được tạo độc giả
        if (req.user.role === 'librarian') {
            role = 'reader';
        }
        const data = await UserService.createUserByAdmin({ fullName, email, password, role });
        new OK({ message: 'Tạo tài khoản thành công', metadata: data }).send(res);
    }

    // Admin cập nhật thông tin user
    async updateUserAdmin(req, res) {
        const { id } = req.params;
        const data = await UserService.updateUserAdmin(id, req.body, req.user);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // Admin xóa user
    async deleteUser(req, res) {
        const { id } = req.params;
        const data = await UserService.deleteUser(id);
        new OK({ message: 'success', metadata: data }).send(res);
    }

    // Admin khóa / mở tài khoản
    async toggleUserActive(req, res) {
        const { id } = req.params;
        const { isActive } = req.body;
        const data = await UserService.toggleUserActive(id, isActive, req.user);
        new OK({ message: 'success', metadata: data }).send(res);
    }
}

module.exports = new UserController();
